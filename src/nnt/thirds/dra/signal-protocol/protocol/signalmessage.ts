import {CiphertextMessage, CiphertextMessageType} from "./ciphertextmessage";
import {IdentityKey, PublicKey} from "../keypair";
import {BufferT} from "../../../../core/buffert";
import {SignalMessageModel} from "../model/whispertext";
import {FixedBuffer32, FixedBuffer8} from "../../../../core/buffer";
import {lambda} from "../../../../core/kernel";
import {HMacDigestBuffer, HMacKeyBuffer} from "../crypto";
import crypto = require('crypto');

const MAC_LENGTH = 8;

export class SignalMessage extends CiphertextMessage {

    private _messageVersion: number;
    private _senderRatchetKey: PublicKey;
    private _counter: number;
    private _previousCounter: number;
    private _ciphertext: Buffer;
    private _serialized: Buffer;

    private constructor() {
        super();
    }

    static Deserialize(serialized: Buffer): SignalMessage {
        let messageparts = BufferT.SplitAs(serialized, 1, serialized.byteLength - 1 - MAC_LENGTH, MAC_LENGTH);
        let version = messageparts[0].readInt8();
        let message = messageparts[1];
        let mac = messageparts[2];

        if (version != this.CURRENT_VERSION) {
            console.error(`dra: 不支持的消息版本 ${version}`);
            return null;
        }

        let whisperMessage = new SignalMessageModel();
        whisperMessage.deserialize(message);

        if (whisperMessage.ciphertext == null ||
            whisperMessage.counter == null ||
            whisperMessage.ratchetKey == null) {
            console.error(`dra: 不完整的消息数据`);
            return null;
        }

        let r = new SignalMessage();
        r._serialized = serialized;
        r._senderRatchetKey = whisperMessage.ratchetKey;
        r._messageVersion = version;
        r._counter = whisperMessage.counter;
        r._previousCounter = whisperMessage.previousCounter;
        r._ciphertext = whisperMessage.ciphertext;

        return r;
    }

    static Create(messageVersion: number, macKey: FixedBuffer32, senderRatchetKey: PublicKey, counter: number, previousCounter: number, ciphertext: Buffer, senderIdentityKey: IdentityKey, receiverIdentityKey: IdentityKey): SignalMessage {
        let version = BufferT.FromInt16BE((this.CURRENT_VERSION << 8) | messageVersion);

        let message = lambda(new SignalMessageModel(), msg => {
            msg.ratchetKey = senderRatchetKey;
            msg.counter = counter;
            msg.previousCounter = previousCounter;
            msg.ciphertext = ciphertext;
            return msg.serialize();
        });

        let mac = this.GetMac(senderIdentityKey, receiverIdentityKey, macKey, Buffer.concat([version, message]));

        let r = new SignalMessage();
        r._serialized = Buffer.concat([version, message, mac.buffer]);
        r._senderRatchetKey = senderRatchetKey;
        r._counter = counter;
        r._previousCounter = previousCounter;
        r._ciphertext = ciphertext;
        r._messageVersion = messageVersion;

        return r;
    }

    get senderRatcherKey() {
        return this._senderRatchetKey;
    }

    get messageVersion() {
        return this._messageVersion;
    }

    get counter() {
        return this._counter;
    }

    get body() {
        return this._ciphertext;
    }

    verifyMac(senderIdentityKey: IdentityKey, receiverIdentityKey: IdentityKey, macKey: HMacKeyBuffer): boolean {
        let parts = BufferT.SplitAs(this._serialized, this._serialized.byteLength - MAC_LENGTH, MAC_LENGTH);
        let ourMac = SignalMessage.GetMac(senderIdentityKey, receiverIdentityKey, macKey, parts[0]);
        let theirMac = parts[1];

        return ourMac.isEqual(theirMac);
    }

    static GetMac(senderIdentityKey: IdentityKey, receiverIdentityKey: IdentityKey, macKey: HMacKeyBuffer, serialized: BufferT): HMacDigestBuffer {
        let cry = crypto.createHmac('sha256', macKey.buffer);
        cry.update(senderIdentityKey.forSerialize.buffer);
        cry.update(receiverIdentityKey.forSerialize.buffer);
        let fullMac = cry.digest();
        return new FixedBuffer8(fullMac.slice(0, MAC_LENGTH));
    }

    serialize(): Buffer {
        return this._serialized;
    }

    type(): CiphertextMessageType {
        return CiphertextMessageType.WHISPER;
    }

    static IsLegacy(message: Buffer) {
        return message && message.byteLength >= 1 && message.readInt8() != this.CURRENT_VERSION;
    }
}