import {Model} from "./model";
import {SignatureBuffer} from "../crypto";
import {IndexedObject} from "../../../../core/kernel";
import {PublicKey} from "./publickey";
import {IdentityKey} from "./identitykey";
import {FixedBuffer32} from "../../../../core/buffer";

export class SignalMessageModel extends Model {

    ratchetKey: PublicKey;
    counter: number;
    previousCounter: number;
    ciphertext: Buffer;

    toPod(): IndexedObject {
        return {
            ratchetKey: this.ratchetKey.serialize(),
            counter: this.counter,
            previousCounter: this.previousCounter,
            ciphertext: this.ciphertext.toString('hex')
        };
    }

    fromPod(obj: IndexedObject): this {
        this.ratchetKey = new PublicKey().deserialize(obj.ratchetKey);
        this.counter = obj.counter;
        this.previousCounter = obj.previousCounter;
        this.ciphertext = Buffer.from(obj.ciphertext, 'hex');
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
        return {
            registrationId: this.registrationId,
            preKeyId: this.preKeyId,
            signedPreKeyId: this.signedPreKeyId,
            baseKey: this.baseKey.serialize(),
            identityKey: this.identityKey.toPod(),
            message: this.message.toString('hex')
        };
    }

    fromPod(obj: IndexedObject): this {
        this.registrationId = obj.registrationId;
        this.preKeyId = obj.preKeyId;
        this.signedPreKeyId = obj.signedPreKeyId;
        this.baseKey = new PublicKey().deserialize(obj.baseKey);
        this.identityKey = new IdentityKey().fromPod(obj.identityKey);
        this.message = Buffer.from(obj.message, 'hex');
        return this;
    }
}

export class KeyExchangeMessageModel extends Model {

    id: number;
    baseKey: PublicKey;
    ratchetKey: PublicKey;
    identityKey: PublicKey;

    toPod(): IndexedObject {
        return {
            id: this.id,
            baseKey: this.baseKey.serialize(),
            ratchetKey: this.ratchetKey.serialize(),
            identityKey: this.identityKey.serialize()
        }
    }

    fromPod(obj: IndexedObject): this {
        this.id = obj.id;
        this.baseKey = new PublicKey().deserialize(obj.baseKey);
        this.ratchetKey = new PublicKey().deserialize(obj.ratchetKey);
        this.identityKey = new PublicKey().deserialize(obj.identityKey);
        return this;
    }
}

export class SenderKeyMessageModel extends Model {

    id: number;
    iteration: number;
    ciphertext: Buffer;

    toPod(): IndexedObject {
        return {
            id: this.id,
            iteration: this.iteration,
            ciphertext: this.ciphertext.toString('hex')
        };
    }

    fromPod(obj: IndexedObject): this {
        this.id = obj.id;
        this.iteration = obj.iteration;
        this.ciphertext = Buffer.from(obj.ciphertext, 'hex');
        return this;
    }
}

export class SenderKeyDistributionMessageModel extends Model {

    id: number;
    iteration: number;
    chainKey: PublicKey;
    signingKey: PublicKey;

    toPod(): IndexedObject {
        return {
            id: this.id,
            iteration: this.iteration,
            chainKey: this.chainKey.serialize(),
            signingKey: this.signingKey.serialize()
        };
    }

    fromPod(obj: IndexedObject): this {
        this.id = obj.id;
        this.iteration = obj.iteration;
        this.chainKey = new PublicKey().deserialize(obj.chainKey);
        this.signingKey = new PublicKey().deserialize(obj.signingKey);
        return this;
    }
}

export class DeviceConsistencyCodeMessageModel extends Model {

    generation: number;
    signature: SignatureBuffer;

    toPod(): IndexedObject {
        return {
            generation: this.generation,
            signature: this.signature.serialize()
        };
    }

    fromPod(obj: IndexedObject): this {
        this.generation = obj.generation;
        this.signature = new FixedBuffer32().deserialize(obj.signature);
        return this;
    }
}