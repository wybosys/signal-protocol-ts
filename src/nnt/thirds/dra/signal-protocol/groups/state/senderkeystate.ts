import {
    SenderChainKeyModel,
    SenderKeyStateStructureModel,
    SenderMessageKeyModel,
    SenderSigningKeyModel
} from "../../model/localstorage";
import {KeyPair, PrivateKey, PublicKey} from "../../keypair";
import {use} from "../../../../../core/kernel";
import {SenderChainKey} from "../ratchet/senderchainkey";
import {SenderMessageKey} from "../ratchet/sendermessagekey";
import {ArrayT} from "../../../../../core/arrayt";

export class SenderKeyState {

    static MAX_MESSAGE_KEYS = 2000;

    private _senderKeyStateStructure: SenderKeyStateStructureModel;

    private constructor() {
    }

    static CreateByState(state: SenderKeyStateStructureModel): SenderKeyState {
        let r = new SenderKeyState();
        r._senderKeyStateStructure = state;
        return r;
    }

    static CreateByKey(id: number, iteration: number, chainKey: Buffer, signatureKey: PublicKey): SenderKeyState {
        return this.Create(id, iteration, chainKey, signatureKey, null);
    }

    static CreateByKeyPair(id: number, iteration: number, chainKey: Buffer, signatureKey: KeyPair): SenderKeyState {
        return this.Create(id, iteration, chainKey, signatureKey.pub, signatureKey.priv);
    }

    protected static Create(id: number, iteration: number, chainKey: Buffer, signatureKeyPublic: PublicKey, signatureKeyPrivate?: PrivateKey): SenderKeyState {
        let senderChainKeyStructure = use(new SenderChainKeyModel(), m => {
            m.iteration = iteration;
            m.seed = chainKey;
        });

        let signingKeyStructure = use(new SenderSigningKeyModel(), m => {
            m.pub = signatureKeyPublic;
            m.priv = signatureKeyPrivate;
        });

        let r = new SenderKeyState();
        r._senderKeyStateStructure = use(new SenderKeyStateStructureModel(), m => {
            m.senderKeyId = id;
            m.senderChainKey = senderChainKeyStructure;
            m.senderSigningKey = signingKeyStructure;
        });

        return r;
    }

    get keyId() {
        return this._senderKeyStateStructure.senderKeyId;
    }

    getSenderChainKey(): SenderChainKey {
        return new SenderChainKey(this._senderKeyStateStructure.senderChainKey.iteration, this._senderKeyStateStructure.senderChainKey.seed);
    }

    setSenderChainKey(chainKey: SenderChainKey) {
        let senderChainKeyStructure = use(new SenderChainKeyModel(), m => {
            m.iteration = chainKey.iteration;
            m.seed = chainKey.seed;
        });

        this._senderKeyStateStructure.senderChainKey = senderChainKeyStructure;
    }

    get signingKeyPublic() {
        return this._senderKeyStateStructure.senderSigningKey.pub;
    }

    get signingKeyPrivate() {
        return this._senderKeyStateStructure.senderSigningKey.priv;
    }

    hasSenderMessageKey(iteration: number): boolean {
        let list = this._senderKeyStateStructure.senderMessageKeys;
        for (let i = 0; i < list.length; ++i) {
            let e = list[i];
            if (e.iteration == iteration)
                return true;
        }
        return false;
    }

    addSenderMessageKey(senderMessageKey: SenderMessageKey) {
        let senderMessageKeyStructure = use(new SenderMessageKeyModel(), m => {
            m.iteration = senderMessageKey.iteration;
            m.seed = senderMessageKey.seed;
        });

        this._senderKeyStateStructure.senderMessageKeys.push(senderMessageKeyStructure);
        if (this._senderKeyStateStructure.senderMessageKeys.length > SenderKeyState.MAX_MESSAGE_KEYS) {
            ArrayT.RemoveObjectAtIndex(this._senderKeyStateStructure.senderMessageKeys, 0);
        }
    }

    removeSenderMessageKey(iteration: number) {
        let result = ArrayT.RemoveObjectByFilter(this._senderKeyStateStructure.senderMessageKeys, e => {
            return e.iteration == iteration;
        });

        if (result) {
            return new SenderMessageKey(result.iteration, result.seed);
        }

        return null;
    }

    get structure() {
        return this._senderKeyStateStructure;
    }
}