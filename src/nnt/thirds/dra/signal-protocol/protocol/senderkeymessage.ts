import {CiphertextMessage, CiphertextMessageType} from "./ciphertextmessage";
import {BufferT} from "../../../../core/buffert";
import {SenderKeyMessageModel} from "../model/whispertext";
import {PrivateKey, PublicKey} from "../model/keypair";
import {lambda} from "../../../../core/kernel";
import {Crypto, SignatureBuffer} from "../crypto";
import {FixedBuffer32} from "../../../../core/buffer";

const SIGNATURE_LENGTH = 64;

export class SenderKeyMessage extends CiphertextMessage {

    private _messageVersion: number;
    private _keyId: number;
    private _iteration: number;
    private _ciphertext: Buffer;
    private _serialized: Buffer;

    static Deserialize(serialized: Buffer): SenderKeyMessage {
        let messageParts = BufferT.SplitAs(serialized, 1, serialized.byteLength - 1 - SIGNATURE_LENGTH, SIGNATURE_LENGTH);
        let version = messageParts[0].readInt8();
        let message = messageParts[1];
        let signature = messageParts[2];

        if (version != this.CURRENT_VERSION) {
            console.error(`dra: 不支持的版本 ${version}`);
            return null;
        }

        let senderKeyMessage = new SenderKeyMessageModel();
        if (senderKeyMessage.id == null ||
            senderKeyMessage.iteration == null ||
            senderKeyMessage.ciphertext == null) {
            console.error(`dra: 消息格式错误`);
            return null;
        }

        let r = new SenderKeyMessage();
        r._serialized = serialized;
        r._messageVersion = version;
        r._keyId = senderKeyMessage.id;
        r._iteration = senderKeyMessage.iteration;
        r._ciphertext = senderKeyMessage.ciphertext;

        return r;
    }

    static Create(keyId: number, iteration: number, ciphertext: Buffer, signatureKey: PrivateKey): SenderKeyMessage {
        let version = BufferT.FromInt16BE((this.CURRENT_VERSION << 8) | this.CURRENT_VERSION);
        let message = lambda(new SenderKeyMessageModel(), m => {
            m.id = keyId;
            m.iteration = iteration;
            m.ciphertext = ciphertext;
            return m.serialize();
        });

        let signature = this.GetSignature(signatureKey, Buffer.concat([version, message]));

        let r = new SenderKeyMessage();
        r._serialized = Buffer.concat([version, message, signature.buffer]);
        r._messageVersion = this.CURRENT_VERSION;
        r._keyId = keyId;
        r._iteration = iteration;
        r._ciphertext = ciphertext;

        return r;
    }

    get keyId() {
        return this._keyId;
    }

    get iteration() {
        return this._iteration;
    }

    get ciphertext() {
        return this._ciphertext;
    }

    verifySignature(signatureKey: PublicKey): boolean {
        let parts = BufferT.SplitAs(this._serialized, this._serialized.byteLength - SIGNATURE_LENGTH, SIGNATURE_LENGTH);
        return Crypto.VerifySign(parts[0], new FixedBuffer32(parts[1]), signatureKey);
    }

    static GetSignature(signatureKey: PrivateKey, serialized: Buffer): SignatureBuffer {
        return Crypto.Sign(serialized, signatureKey);
    }

    serialize(): Buffer {
        return this._serialized;
    }

    type(): CiphertextMessageType {
        return CiphertextMessageType.SENDERKEY;
    }
}