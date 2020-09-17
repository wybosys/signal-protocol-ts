import {Model} from "./model";
import {KeyPair} from "./keypair";
import {FixedBuffer16, FixedBuffer32} from "../../../../core/buffer";
import {IndexedObject} from "../../../../core/kernel";
import {HMacKeyBuffer, IvBuffer} from "../crypto";
import {PublicKey} from "./publickey";
import {ArrayT} from "../../../../core/arrayt";

export class ChainModel extends Model {

    senderRatchetKey: KeyPair;
    chainKey: ChainKeyModel;
    messageKeys: MessageKeyModel[] = [];

    toPod(): IndexedObject {
        return {
            senderRatchetKey: this.senderRatchetKey.toPod(),
            chainKey: this.chainKey.toPod(),
            messageKeys: ArrayT.Convert(this.messageKeys, e => e.toPod())
        };
    }

    fromPod(obj: IndexedObject): this {
        this.senderRatchetKey = new KeyPair().fromPod(obj.senderRatchetKey);
        this.chainKey = new ChainKeyModel().fromPod(obj.chainKey);
        this.messageKeys = ArrayT.Convert(obj.messageKeys, e => new MessageKeyModel().fromPod(e));
        return this;
    }
}

export class ChainKeyModel extends Model {

    index: number;
    key: PublicKey;

    toPod(): IndexedObject {
        return {
            index: this.index,
            key: this.key.serialize()
        };
    }

    fromPod(obj: IndexedObject): this {
        this.index = obj.index;
        this.key = new PublicKey().deserialize(obj.key);
        return this;
    }
}

export class MessageKeyModel extends Model {

    index: number;
    cipherKey: KeyPair;
    macKey: HMacKeyBuffer;
    iv: IvBuffer;

    toPod(): IndexedObject {
        return {
            index: this.index,
            cipherKey: this.cipherKey.toPod(),
            macKey: this.macKey.serialize(),
            iv: this.iv.serialize()
        };
    }

    fromPod(obj: IndexedObject): this {
        this.index = obj.index;
        this.cipherKey = new KeyPair().deserialize(obj.cipherKey);
        this.macKey = new FixedBuffer32().deserialize(obj.macKey);
        this.iv = new FixedBuffer16().deserialize(obj.iv);
        return this;
    }
}

export class PendingKeyExchangeModel extends Model {

    sequence: number;
    localBaseKey: KeyPair;
    localRatchetKey: KeyPair;
    localIdentityKey: KeyPair;

    toPod(): IndexedObject {
        return {
            sequence: this.sequence,
            localBaseKey: this.localBaseKey.toPod(),
            localRatchetKey: this.localRatchetKey.toPod(),
            localIdentityKey: this.localIdentityKey.toPod()
        };
    }

    fromPod(obj: IndexedObject): this {
        this.sequence = obj.sequence;
        this.localBaseKey = new KeyPair().fromPod(obj.localBaseKey);
        this.localRatchetKey = new KeyPair().fromPod(obj.localRatchetKey);
        this.localIdentityKey = new KeyPair().fromPod(obj.localIdentityKey);
        return this;
    }
}

export class PendingPreKeyModel extends Model {

    preKeyId: number;
    signedPreKeyId: number;
    baseKey: PublicKey;

    toPod(): IndexedObject {
        return {
            preKeyId: this.preKeyId,
            signedPreKeyId: this.signedPreKeyId,
            baseKey: this.baseKey.serialize()
        };
    }

    fromPod(obj: IndexedObject): this {
        this.preKeyId = obj.preKeyId;
        this.signedPreKeyId = obj.signedPreKeyId;
        this.baseKey = new PublicKey().deserialize(obj.baseKey);
        return this;
    }
}

export class SessionStructureModel extends Model {

    sessionVersion: number;
    localIdentity: PublicKey;
    remoteIdentity: PublicKey;

    rootKey: FixedBuffer32;
    previousCounter: number;

    senderChain: ChainModel;
    receiverChains: ChainModel[] = [];

    pendingKeyExchange: PendingKeyExchangeModel;
    pendingPreKey: PendingPreKeyModel;

    remoteRegistrationId: number;
    localRegistrationId: number;

    needsRefresh: boolean;
    aliceBaseKey: PublicKey;

    toPod(): IndexedObject {
        return {
            sessionVersion: this.sessionVersion,
            localIdentity: this.localIdentity.serialize(),
            remoteIdentity: this.remoteIdentity.serialize(),
            rootKey: this.rootKey.serialize(),
            previousCounter: this.previousCounter,
            senderChain: this.senderChain.toPod(),
            receiverChains: ArrayT.Convert(this.receiverChains, e => e.toPod()),
            pendingKeyExchange: this.pendingKeyExchange.toPod(),
            pendingPreKey: this.pendingPreKey.toPod(),
            remoteRegistrationId: this.remoteRegistrationId,
            localRegistrationId: this.localRegistrationId,
            needsRefresh: this.needsRefresh,
            aliceBaseKey: this.aliceBaseKey.serialize()
        };
    }

    fromPod(obj: IndexedObject): this {
        this.sessionVersion = obj.sessionVersion;
        this.localIdentity = new PublicKey().deserialize(obj.localIdentity);
        this.remoteIdentity = new PublicKey().deserialize(obj.remoteIdentity);
        this.rootKey = new FixedBuffer32(obj.rootKey);
        this.previousCounter = obj.previousCounter;
        this.senderChain = new ChainModel().fromPod(obj.senderChain);
        this.receiverChains = ArrayT.Convert(obj.receiverChains, e => new ChainModel().fromPod(e));
        this.pendingKeyExchange = new PendingKeyExchangeModel().fromPod(obj.pendingKeyExchange);
        this.pendingPreKey = new PendingPreKeyModel().fromPod(obj.pendingPreKey);
        this.remoteRegistrationId = obj.remoteRegistrationId;
        this.localRegistrationId = obj.localRegistrationId;
        this.needsRefresh = obj.needsRefresh;
        this.aliceBaseKey = new PublicKey().deserialize(obj.aliceBaseKey);
        return this;
    }
}

export class RecordStructureModel extends Model {

    currentSession: SessionStructureModel;
    previousSessions: SessionStructureModel[] = [];

    toPod(): IndexedObject {
        return {
            currentSession: this.currentSession.toPod(),
            previousSessions: ArrayT.Convert(this.previousSessions, e => e.toPod())
        };
    }

    fromPod(obj: IndexedObject): this {
        this.currentSession = new SessionStructureModel().fromPod(obj.currentSession);
        this.previousSessions = ArrayT.Convert(obj.previousSessions, e => new SessionStructureModel().fromPod(e));
        return this;
    }
}

export class PreKeyRecordStructureModel extends Model {

    id: number;
    key: KeyPair;

    toPod(): IndexedObject {
        return {
            id: this.id,
            key: this.key.toPod()
        };
    }

    fromPod(obj: IndexedObject): this {
        this.id = obj.id;
        this.key = new KeyPair().fromPod(obj.key);
        return this;
    }
}

export class SignedPreKeyRecordStructureModel extends Model {

    id: number;
    key: KeyPair;
    signature: FixedBuffer32;
    timestamp: number;

    toPod(): IndexedObject {
        return {
            id: this.id,
            key: this.key.toPod(),
            signature: this.signature.serialize(),
            timestamp: this.timestamp
        };
    }

    fromPod(obj: IndexedObject): this {
        this.id = obj.id;
        this.key = new KeyPair().fromPod(obj.key);
        this.signature = new FixedBuffer32().deserialize(obj.signature);
        this.timestamp = obj.timestamp;
        return this;
    }
}

export class SenderChainKeyModel extends Model {

    iteration: number;
    seed: Buffer;

    toPod(): IndexedObject {
        return {
            iteration: this.iteration,
            seed: this.seed.toString('hex')
        };
    }

    fromPod(obj: IndexedObject): this {
        this.iteration = obj.iteration;
        this.seed = Buffer.from(obj.seed, 'hex');
        return this;
    }
}

export class SenderMessageKeyModel extends Model {

    iteration: number;
    seed: Buffer;

    toPod(): IndexedObject {
        return {
            iteration: this.iteration,
            seed: this.seed.toString('hex')
        };
    }

    fromPod(obj: IndexedObject): this {
        this.iteration = obj.iteration;
        this.seed = Buffer.from(obj.seed, 'hex');
        return this;
    }
}

export class SenderSigningKeyModel extends KeyPair {

}

export class SenderKeyStateStructureModel extends Model {

    senderKeyId: number;
    senderChainKey: SenderChainKeyModel;
    senderSigningKey: SenderSigningKeyModel;
    senderMessageKeys: SenderMessageKeyModel[] = [];

    toPod(): IndexedObject {
        return {
            senderKeyId: this.senderKeyId,
            senderChainKey: this.senderChainKey.toPod(),
            senderSigningKey: this.senderSigningKey.toPod(),
            senderMessageKeys: ArrayT.Convert(this.senderMessageKeys, e => e.toPod())
        };
    }

    fromPod(obj: IndexedObject): this {
        this.senderKeyId = obj.senderKeyId;
        this.senderChainKey = new SenderChainKeyModel().fromPod(obj.senderChainKey);
        this.senderSigningKey = new SenderSigningKeyModel().fromPod(obj.senderSigningKey);
        this.senderMessageKeys = ArrayT.Convert(obj.senderMessageKeys, e => new SenderMessageKeyModel().fromPod(e));
        return this;
    }
}

export class SenderKeyRecordStructureModel extends Model {

    senderKeyStates: SenderKeyStateStructureModel[] = [];

    toPod(): IndexedObject {
        return {
            senderKeyStates: ArrayT.Convert(this.senderKeyStates, e => e.toPod())
        };
    }

    fromPod(obj: IndexedObject): this {
        this.senderKeyStates = ArrayT.Convert(obj.senderKeyStates, e => new SenderKeyStateStructureModel().fromPod(e));
        return this;
    }
}