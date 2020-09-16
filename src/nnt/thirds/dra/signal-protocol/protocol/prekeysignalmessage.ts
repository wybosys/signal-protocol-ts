import {CiphertextMessage, CiphertextMessageType} from "./ciphertextmessage";
import {IdentityKey, PublicKey} from "../keypair";
import {PreKeySignalMessageModel} from "../model/whispertext";
import {SignalMessage} from "./signalmessage";
import {BufferT} from "../../../../core/buffert";

export class PreKeySignalMessage extends CiphertextMessage {

    private _version: number;
    private _registrationId: number;
    private _preKeyId?: number;
    private _signedPreKeyId: number;
    private _baseKey: PublicKey;
    private _identityKey: IdentityKey;
    private _message: SignalMessage;
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
        r._message = SignalMessage.Deserialize(preKeyWhisperMessage.message);

        return r;
    }

    static Create(messageVersion: number, registrationId: number, preKeyId: number, signedPreKeyId: number, baseKey: PublicKey, identityKey: IdentityKey, message: SignalMessage): PreKeySignalMessage {
        let r = new PreKeySignalMessage();
        r._version = messageVersion;
        r._registrationId = registrationId;
        r._preKeyId = preKeyId;
        r._signedPreKeyId = signedPreKeyId;
        r._baseKey = baseKey;
        r._identityKey = identityKey;
        r._message = message;

        let builder = new PreKeySignalMessageModel();
        builder.signedPreKeyId = signedPreKeyId;
        builder.baseKey = baseKey;
        builder.identityKey = identityKey;
        builder.message = message.serialize();
        builder.registrationId = registrationId;
        builder.preKeyId = preKeyId;

        let versionBytes = BufferT.FromInt16BE((this.CURRENT_VERSION << 8) | r._version);
        let messageBytes = builder.serialize();

        r._serialized = Buffer.concat([versionBytes, messageBytes]);
        return r;
    }

    get messageVersion() {
        return this._version;
    }

    get identityKey() {
        return this._identityKey;
    }

    get registrationId() {
        return this._registrationId;
    }

    get preKeyId() {
        return this._preKeyId;
    }

    get signedPreKeyId() {
        return this._signedPreKeyId;
    }

    get baseKey() {
        return this._baseKey;
    }

    get whisperMessage() {
        return this._message;
    }

    serialize(): Buffer {
        return this._serialized;
    }

    type(): CiphertextMessageType {
        return CiphertextMessageType.PREKEY;
    }
}