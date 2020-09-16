import {Model} from "./model";
import {IdentityKey, PublicKey} from "../keypair";
import {FixedBuffer32} from "../../../../core/buffer";
import {SignatureBuffer} from "../crypto";
import {IndexedObject} from "../../../../core/kernel";

export class SignalMessageModel extends Model {

    ratchetKey: PublicKey;
    counter: number;
    previousCounter: number;
    ciphertext: Buffer;

    toPod(): IndexedObject {
        return null;
    }

    fromPod(obj: IndexedObject): this {
        return this;
    }
}

export class PreKeySignalMessageModel extends Model {

    registrationId: number;
    preKeyId: number;
    signedPreKeyId: number;
    baseKey: PublicKey;
    identityKey: IdentityKey;
    message: Buffer;

    toPod(): IndexedObject {
        return null;
    }

    fromPod(obj: IndexedObject): this {
        return this;
    }
}

export class KeyExchangeMessageModel extends Model {

    id: number;
    baseKey: PublicKey;
    ratchetKey: PublicKey;
    identityKey: PublicKey;
    baseKeySignature: FixedBuffer32;

    toPod(): IndexedObject {
        return null;
    }

    fromPod(obj: IndexedObject): this {
        return this;
    }
}

export class SenderKeyMessageModel extends Model {

    id: number;
    iteration: number;
    ciphertext: Buffer;

    toPod(): IndexedObject {
        return null;
    }

    fromPod(obj: IndexedObject): this {
        return this;
    }
}

export class SenderKeyDistributionMessageModel extends Model {

    id: number;
    iteration: number;
    chainKey: PublicKey;
    signingKey: PublicKey;

    toPod(): IndexedObject {
        return null;
    }

    fromPod(obj: IndexedObject): this {
        return this;
    }
}

export class DeviceConsistencyCodeMessageModel extends Model {

    generation: number;
    signature: SignatureBuffer;

    toPod(): IndexedObject {
        return null;
    }

    fromPod(obj: IndexedObject): this {
        return this;
    }
}