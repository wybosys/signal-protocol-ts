import {Model} from "./model";
import {PublicKey} from "../keypair";
import {FixedBuffer32} from "../../../../core/buffer";

export class SignalMessage extends Model {

    ratchetKey: PublicKey;
    counter: number;
    previousCounter: number;
    ciphertext: Buffer;
}

export class PreKeySignalMessage extends Model {

    registrationId: number;
    preKeyId: number;
    signedPreKeyId: number;
    baseKey: PublicKey;
    identityKey: PublicKey;
    message: Buffer;
}

export class KeyExchangeMessage extends Model {

    id: number;
    baseKey: PublicKey;
    ratchetKey: PublicKey;
    identityKey: PublicKey;
    baseKeySignature: FixedBuffer32;
}

export class SenderKeyMessage extends Model {

    id: number;
    iteration: number;
    ciphertext: Buffer;
}

export class SenderKeyDistributionMessage extends Model {

    id: number;
    iteration: number;
    chainKey: PublicKey;
    signingKey: PublicKey;
}

export class DeviceConsistencyCodeMessage extends Model {
    generation: number;
    signature: FixedBuffer32;
}