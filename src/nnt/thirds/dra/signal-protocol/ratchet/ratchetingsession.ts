import {SessionState} from "../state/sessionstate";
import {AliceParameters} from "./aliceparameters";
import {use} from "../../../../core/kernel";
import {SymmetricParameters} from "./symmetricparameters";
import {RootKey} from "./rootkey";
import {ChainKey} from "./chainkey";
import {FixedBuffer32} from "../../../../core/buffer";
import {HKDFv3} from "../kdf/HKDFv3";
import {BufferT} from "../../../../core/buffert";
import {BobParameters} from "./bobparameters";
import {CiphertextMessage} from "../protocol/ciphertextmessage";
import {Crypto} from "../crypto";
import {BytesBuilder} from "../../../../core/bytes";
import {PublicKey} from "../model/publickey";
import {IdentityKey} from "../model/identitykey";

export class RatchetingSession {

    static InitSymmetricSession(sessionState: SessionState, parameters: SymmetricParameters) {
        if (this.IsAlice(parameters.ourBaseKey.publicKey, parameters.theirBaseKey)) {
            let aliceParameters = use(new AliceParameters(), p => {
                p.ourBaseKey = parameters.ourBaseKey;
                p.ourIdentityKey = parameters.ourIdentityKey;
                p.theirRatchetKey = parameters.theirRatchetKey;
                p.theirIdentityKey = parameters.theirIdentityKey;
                p.theirSignedPreKey = parameters.theirBaseKey;
                p.theirOneTimePreKey = null;
            });
            this.InitAliceSession(sessionState, aliceParameters);
        } else {
            let bobParameters = use(new BobParameters(), p => {
                p.ourIdentityKey = parameters.ourIdentityKey;
                p.ourRatchetKey = parameters.ourRatchetKey;
                p.ourOneTimePreKey = null;
                p.theirBaseKey = parameters.theirBaseKey;
                p.theirIdentityKey = parameters.theirIdentityKey;
            });
            this.InitBobSession(sessionState, bobParameters);
        }
    }

    static InitAliceSession(sessionState: SessionState, parameters: AliceParameters) {
        sessionState.sessionVersion = CiphertextMessage.CURRENT_VERSION;
        sessionState.remoteIdentityKey = new IdentityKey(parameters.theirIdentityKey.publicKey);
        sessionState.localIdentityKey = new IdentityKey(parameters.ourIdentityKey.publicKey);

        let sendingRatchetKey = Crypto.GenerateKeyPair();
        let secrets = new BytesBuilder();

        secrets.addBuffer(this.GetDiscontinuityBytes());
        secrets.addBuffer(Crypto.SharedKey(parameters.theirSignedPreKey, parameters.ourIdentityKey.privateKey).buffer);
        secrets.addBuffer(Crypto.SharedKey(parameters.theirIdentityKey.publicKey, parameters.ourBaseKey.privateKey).buffer);
        secrets.addBuffer(Crypto.SharedKey(parameters.theirSignedPreKey, parameters.ourBaseKey.privateKey).buffer);

        if (parameters.theirOneTimePreKey) {
            secrets.addBuffer(Crypto.SharedKey(parameters.theirOneTimePreKey, parameters.ourBaseKey.privateKey).buffer);
        }

        let derivedKeys = this.CalculateDerivedKeys(new FixedBuffer32(secrets.buffer));
        let sendingChain = derivedKeys.rootKey.createChain(parameters.theirRatchetKey, sendingRatchetKey);

        sessionState.addReceiverChain(parameters.theirRatchetKey, derivedKeys.chainKey);
        sessionState.setSenderChain(sendingRatchetKey, sendingChain[1]);
        sessionState.setRootKey(sendingChain[0]);
    }

    static InitBobSession(sessionState: SessionState, parameters: BobParameters) {
        sessionState.sessionVersion = CiphertextMessage.CURRENT_VERSION;
        sessionState.remoteIdentityKey = new IdentityKey(parameters.theirIdentityKey.publicKey);

        let secrets = new BytesBuilder();
        secrets.addBuffer(this.GetDiscontinuityBytes());
        secrets.addBuffer(Crypto.SharedKey(parameters.theirIdentityKey.publicKey, parameters.ourSignedPreKey.privateKey).buffer);
        secrets.addBuffer(Crypto.SharedKey(parameters.theirBaseKey, parameters.ourIdentityKey.privateKey).buffer);
        secrets.addBuffer(Crypto.SharedKey(parameters.theirBaseKey, parameters.ourSignedPreKey.privateKey).buffer);

        if (parameters.ourOneTimePreKey) {
            secrets.addBuffer(Crypto.SharedKey(parameters.theirBaseKey, parameters.ourOneTimePreKey.privateKey).buffer);
        }

        let derivedKeys = this.CalculateDerivedKeys(new FixedBuffer32(secrets.buffer));

        sessionState.setSenderChain(parameters.ourRatchetKey, derivedKeys.chainKey);
        sessionState.setRootKey(derivedKeys.rootKey);
    }

    private static GetDiscontinuityBytes(): Buffer {
        return Buffer.alloc(32, 0xff);
    }

    private static CalculateDerivedKeys(masterSecret: FixedBuffer32): DerivedKeys {
        let kdf = new HKDFv3();
        let derivedSecretBytes = kdf.deriveSecrets(masterSecret.buffer, Buffer.from('WhisperText'), 64);
        let derivedSecrets = BufferT.SplitAs(derivedSecretBytes, 32, 32);
        let rootKey = new RootKey(kdf, new FixedBuffer32(derivedSecrets[0]));
        let chainKey = new ChainKey(kdf, new PublicKey(new FixedBuffer32(derivedSecrets[1])), 0);
        return new DerivedKeys(rootKey, chainKey);
    }

    private static IsAlice(ourKey: PublicKey, theirKey: PublicKey): boolean {
        return ourKey.compare(theirKey) < 0;
    }
}

class DerivedKeys {

    private _rootKey: RootKey;
    private _chainKey: ChainKey;

    constructor(rootKey: RootKey, chainKey: ChainKey) {
        this._rootKey = rootKey;
        this._chainKey = chainKey;
    }

    get rootKey() {
        return this._rootKey;
    }

    get chainKey() {
        return this._chainKey;
    }
}