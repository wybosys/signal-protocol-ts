import {CiphertextMessage} from "./ciphertextmessage";
import {IdentityKey, PublicKey} from "../keypair";
import {PreKeySignalMessageModel, SignalMessageModel} from "../model/whispertext";

export class PreKeySignalMessage extends CiphertextMessage {

    private _version: number;
    private _registrationId: number;
    private _preKeyId?: number;
    private _signedPreKeyId: number;
    private _baseKey: PublicKey;
    private _identityKey: IdentityKey;
    private _message: SignalMessageModel;
    private _serialized: Buffer;

    static Deserialize(serialized: Buffer): PreKeySignalMessage {
        let r = new PreKeySignalMessage();
        r._version = serialized.readInt8();
        if (r._version != CiphertextMessage.CURRENT_VERSION) {
            console.error(`dra: 不支持的版本 ${r._version}`);
            return null;
        }

        let preKeyWhisperMessage = new PreKeySignalMessageModel();
        preKeyWhisperMessage.deserialize(serialized.subarray(1, serialized.byteLength));

        if (!preKeyWhisperMessage.signedPreKeyId ||
            !preKeyWhisperMessage.baseKey ||
            !preKeyWhisperMessage.identityKey ||
            !preKeyWhisperMessage.message) {
            console.error(`dra: 不完整的信息`);
        }

        r._serialized = serialized;
        r._registrationId = preKeyWhisperMessage.registrationId;
        r._preKeyId = preKeyWhisperMessage.preKeyId;
        r._signedPreKeyId = preKeyWhisperMessage.signedPreKeyId;
        r._baseKey = preKeyWhisperMessage.baseKey;
        r._identityKey = preKeyWhisperMessage.identityKey;

        return r;
    }
}