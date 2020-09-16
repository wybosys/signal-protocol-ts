import {HKDF} from "../kdf/HKDF";
import {KeyPair, PublicKey} from "../keypair";
import {make_tuple2, tuple2} from "../../../../core/kernel";
import {ChainKey} from "./chainkey";
import {Crypto, SaltBuffer} from "../crypto";
import {DerivedMessageSecrets} from "../kdf/derivedmessagesecrets";
import {DerivedRootSecrets} from "../kdf/derivedrootsecrets";

export class RootKey {

    private _kdf: HKDF;
    private _key: SaltBuffer;

    constructor(kdf: HKDF, key: SaltBuffer) {
        this._kdf = kdf;
        this._key = key;
    }

    get keyBytes() {
        return this._key;
    }

    createChain(theirRatchetKey: PublicKey, ourRatchetKey: KeyPair): tuple2<RootKey, ChainKey> {
        let sharedSecret = Crypto.SharedKey(theirRatchetKey, ourRatchetKey.priv);
        let derivedSecretBytes = this._kdf.deriveSecrets(sharedSecret, Buffer.from('WhisperRatchet'), DerivedMessageSecrets.SIZE, this._key);
        let derivedSecrets = new DerivedRootSecrets(derivedSecretBytes);

        let newRootKey = new RootKey(this._kdf, derivedSecrets.rootKey.forSerialize);
        let newChainKey = new ChainKey(this._kdf, derivedSecrets.chainKey, 0);

        return make_tuple2(newRootKey, newChainKey);
    }
}