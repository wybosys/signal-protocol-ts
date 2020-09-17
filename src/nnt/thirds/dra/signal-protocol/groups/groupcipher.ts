import {SenderKeyStore} from "./state/senderkeystore";
import {SenderKeyName} from "./senderkeyname";
import {SenderKeyState} from "./state/senderkeystate";
import {SenderMessageKey} from "./ratchet/sendermessagekey";
import {SenderKeyMessage} from "../protocol/senderkeymessage";
import {AesKeyBuffer, IvBuffer} from "../crypto";
import {FixedBuffer32} from "../../../../core/buffer";
import crypto = require('crypto');

export class GroupCipher {

    private _senderKeyStore: SenderKeyStore;
    private _senderKeyId: SenderKeyName;

    constructor(senderKeyStore: SenderKeyStore, senderKeyId: SenderKeyName) {
        this._senderKeyStore = senderKeyStore;
        this._senderKeyId = senderKeyId;
    }

    async encrypt(paddedPlaintext: Buffer): Promise<Buffer> {
        let record = await this._senderKeyStore.loadSenderKey(this._senderKeyId);
        let senderKeyState = record.getSenderKeyState();
        let senderKey = senderKeyState.getSenderChainKey().getSenderMessageKey();
        let ciphertext = GroupCipher.GetCipherText(senderKey.iv, new FixedBuffer32(senderKey.cipherKey), paddedPlaintext);

        let senderKeyMessage = SenderKeyMessage.Create(
            senderKeyState.keyId,
            senderKey.iteration,
            ciphertext,
            senderKeyState.signingKeyPrivate
        );

        senderKeyState.setSenderChainKey(senderKeyState.getSenderChainKey().getNext());
        await this._senderKeyStore.storeSenderKey(this._senderKeyId, record);

        return senderKeyMessage.serialize();
    }

    async decrypt(senderKeyMessageBytes: Buffer): Promise<Buffer> {
        let record = await this._senderKeyStore.loadSenderKey(this._senderKeyId);

        if (record.isEmpty()) {
            throw new Error(`dra: 没有找到senderkey ${this._senderKeyId}`);
        }

        let senderKeyMessage = SenderKeyMessage.Deserialize(senderKeyMessageBytes);
        let senderKeyState = record.getSenderKeyStateById(senderKeyMessage.keyId);

        if (!senderKeyMessage.verifySignature(senderKeyState.signingKeyPublic))
            throw new Error(`dra: 消息验证失败`);

        let senderKey = this.getSenderKey(senderKeyState, senderKeyMessage.iteration);

        let plaintext = GroupCipher.GetPlainText(senderKey.iv, new FixedBuffer32(senderKey.cipherKey), senderKeyMessage.ciphertext);

        await this._senderKeyStore.storeSenderKey(this._senderKeyId, record);

        return plaintext;
    }

    private getSenderKey(senderKeyState: SenderKeyState, iteration: number): SenderMessageKey {
        let senderChainKey = senderKeyState.getSenderChainKey();
        if (senderChainKey.iteration > iteration) {
            if (senderKeyState.hasSenderMessageKey(iteration)) {
                return senderKeyState.removeSenderMessageKey(iteration);
            } else {
                throw new Error(`dra: 收到已经过期的计数器消息`);
            }
        }

        if (iteration - senderChainKey.iteration > 2000) {
            throw new Error('dra: 消息数量超出最大限制');
        }

        while (senderChainKey.iteration < iteration) {
            senderKeyState.addSenderMessageKey(senderChainKey.getSenderMessageKey());
            senderChainKey = senderChainKey.getNext();
        }

        senderKeyState.setSenderChainKey(senderChainKey.getNext());
        return senderChainKey.getSenderMessageKey();
    }

    private static GetPlainText(iv: IvBuffer, key: AesKeyBuffer, ciphertext: Buffer): Buffer {
        let cry = crypto.createDecipheriv('aes-128-cbc', key.buffer, iv.buffer);
        cry.update(ciphertext);
        return cry.final();
    }

    private static GetCipherText(iv: IvBuffer, key: AesKeyBuffer, plaintext: Buffer): Buffer {
        let cry = crypto.createCipheriv('aes-128-cbc', key.buffer, iv.buffer);
        cry.update(plaintext);
        return cry.final();
    }
}