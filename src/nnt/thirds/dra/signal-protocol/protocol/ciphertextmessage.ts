import {ISerializableObject} from "../../../../core/object";

export enum CiphertextMessageType {
    WHISPER = 2,
    PREKEY = 3,
    SENDERKEY = 4,
    SENDERKEY_DISTRIBUTION = 5
}

export abstract class CiphertextMessage implements ISerializableObject {

    abstract serialize(): Buffer;

    deserialize(buf: Buffer): this {
        return null;
    }

    abstract type(): number;

    static CURRENT_VERSION = 3;
    static ENCRYPTED_MESSAGE_OVERHEAD = 53;
}