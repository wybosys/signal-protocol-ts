import {Model} from "./model";
import {KeyPair, PreKey, PublicKey} from "../keypair";
import {FixedBuffer32} from "../../../../core/buffer";
import {IndexedObject} from "../../../../core/kernel";
import {HMacKeyBuffer, IvBuffer} from "../crypto";

export class ChainModel extends Model {

    senderRatchetKey: KeyPair;
    chainKey: ChainKeyModel;
    messageKeys: MessageKeyModel[] = [];

    toPod(): IndexedObject {
        return null;
    }

    fromPod(obj: IndexedObject): this {
        return this;
    }
}

export class ChainKeyModel extends PreKey {

}

export class MessageKeyModel extends Model {

    index: number;
    cipherKey: KeyPair;
    macKey: HMacKeyBuffer;
    iv: IvBuffer;

    toPod(): IndexedObject {
        return null;
    }

    fromPod(obj: IndexedObject): this {
        return this;
    }
}

export class PendingKeyExchangeModel extends Model {

    sequence: number;
    localBaseKey: KeyPair;
    localRatchetKey: KeyPair;
    localIdentityKey: KeyPair;

    toPod(): IndexedObject {
        return null;
    }

    fromPod(obj: IndexedObject): this {
        return this;
    }
}

export class PendingPreKeyModel extends Model {

    preKeyId: number;
    signedPreKeyId: number;
    baseKey: PublicKey;

    toPod(): IndexedObject {
        return null;
    }

    fromPod(obj: IndexedObject): this {
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
        return null;
    }

    fromPod(obj: IndexedObject): this {
        return this;
    }
}

export class RecordStructureModel extends Model {

    currentSession: SessionStructureModel;
    previousSessions: SessionStructureModel[] = [];

    toPod(): IndexedObject {
        return null;
    }

    fromPod(obj: IndexedObject): this {
        return this;
    }
}

export class PreKeyRecordStructureModel extends Model {

    id: number;
    key: KeyPair;

    toPod(): IndexedObject {
        return null;
    }

    fromPod(obj: IndexedObject): this {
        return this;
    }
}

export class SignedPreKeyRecordStructureModel extends Model {

    id: number;
    key: KeyPair;
    signature: FixedBuffer32;
    timestamp: number;

    toPod(): IndexedObject {
        return null;
    }

    fromPod(obj: IndexedObject): this {
        return this;
    }
}

export class SenderChainKeyModel extends Model {

    iteration: number;
    seed: Buffer;

    toPod(): IndexedObject {
        return {
            iteration: this.iteration,
            seed: this.seed
        };
    }

    fromPod(obj: IndexedObject): this {
        this.iteration = obj.iteration;
        this.seed = obj.seed;
        return this;
    }
}

export class SenderMessageKeyModel extends Model {

    iteration: number;
    seed: Buffer;

    toPod(): IndexedObject {
        return {
            iteration: this.iteration,
            seed: this.seed
        };
    }

    fromPod(obj: IndexedObject): this {
        this.iteration = obj.iteration;
        this.seed = obj.seed;
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
        return null;
    }

    fromPod(obj: IndexedObject): this {
        return this;
    }
}

export class SenderKeyRecordStructureModel extends Model {

    senderKeyStates: SenderKeyStateStructureModel[] = [];

    toPod(): IndexedObject {
        return null;
    }

    fromPod(obj: IndexedObject): this {
        return this;
    }
}