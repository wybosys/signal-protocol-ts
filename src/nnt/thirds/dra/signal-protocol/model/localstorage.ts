import {Model} from "./model";
import {KeyPair, PreKey, PrivateKey, PublicKey} from "../keypair";
import {FixedBuffer32} from "../../../../core/buffer";

export class Chain extends Model {
    senderRatchetKey: KeyPair;
    chainKey: ChainKey;
    messageKeys: MessageKey[] = [];
}

export class ChainKey extends PreKey {

}

export class MessageKey extends Model {

    index: number;
    cpherKey: PrivateKey;
    macKey: FixedBuffer32;
    iv: FixedBuffer32;
}

export class PendingKeyExchange extends Model {

    sequence: number;
    localBaseKey: KeyPair;
    localRatchetKey: KeyPair;
    localIdentityKey: KeyPair;
}

export class PendingPreKey extends Model {

    preKeyId: number;
    signedPreKeyId: number;
    baseKey: PublicKey;
}

export class SessionStructure extends Model {

    sessionVersion: number;
    localIdentity: PublicKey;
    remoteIdentity: PublicKey;

    rootKey: FixedBuffer32;
    previousCounter: number;

    senderChain: Chain;
    receiverChains: Chain[] = [];

    pendingKeyExchange: PendingKeyExchange;
    pendingPreKey: PendingPreKey;

    remoteRegistrationId: number;
    localRegistrationId: number;

    needsRefresh: boolean;
    aliceBaseKey: PublicKey;
}

export class RecordStructure extends Model {

    currentSession: SessionStructure;
    previousSessions: SessionStructure[] = [];
}

export class PreKeyRecordStructure extends Model {

    id: number;
    key: KeyPair;
}

export class SignedPreKeyRecordStructure extends Model {

    id: number;
    key: KeyPair;
    signature: FixedBuffer32;
    timestamp: number;
}

export class SenderChainKey extends Model {

    iteration: number;
    seed: FixedBuffer32;
}

export class SenderMessageKey extends Model {

    iteration: number;
    seed: FixedBuffer32;
}

export class SenderSigningKey extends KeyPair {

}

export class SenderKeyStateStructure extends Model {

    senderKeyId: number;
    senderChainKey: SenderChainKey;
    senderSigningKey: SenderSigningKey;
    senderMessageKeys: SenderMessageKey[] = [];
}

export class SenderKeyRecordStructure extends Model {

    senderKeyStates: SenderKeyStateStructure[] = [];
}