import {SessionStore} from "./state/sessionstore";
import {Direction, IdentityKeyStore} from "./state/identitykeystore";
import {SessionBuilder} from "./sessionbuilder";
import {PreKeyStore} from "./state/prekeystore";
import {Address} from "./address";
import {SignedPreKeyStore} from "./state/signedprekeystore";
import {ProtocolStore} from "./state/protocolstore";
import {CiphertextMessage} from "./protocol/ciphertextmessage";
import {MessageKeys} from "./ratchet/messagekeys";
import {SignalMessage} from "./protocol/signalmessage";
import {PreKeySignalMessage} from "./protocol/prekeysignalmessage";
import {SessionRecord} from "./state/sessionrecord";
import {SessionState} from "./state/sessionstate";
import {ArrayT} from "../../../core/arrayt";
import {PublicKey} from "./keypair";
import {ChainKey} from "./ratchet/chainkey";
import {Crypto} from "./crypto";
import crypto = require('crypto');

export class SessionCipher {

    private _sessionStore: SessionStore;
    private _identityKeyStore: IdentityKeyStore;
    private _sessionBuilder: SessionBuilder;
    private _preKeyStore: PreKeyStore;
    private _remoteAddress: Address;

    private constructor() {
    }

    static Create(sessionStore: SessionStore, preKeyStore: PreKeyStore, signedPreKeyStore: SignedPreKeyStore, identityKeyStore: IdentityKeyStore, remoteAddress: Address): SessionCipher {
        let r = new SessionCipher();
        r._sessionStore = sessionStore;
        r._preKeyStore = preKeyStore;
        r._identityKeyStore = identityKeyStore;
        r._remoteAddress = remoteAddress;
        r._sessionBuilder = SessionBuilder.Create(sessionStore, preKeyStore, signedPreKeyStore, identityKeyStore, remoteAddress);
        return r;
    }

    static CreateByProtocolStore(store: ProtocolStore, remoteAddress: Address): SessionCipher {
        return this.Create(store, store, store, store, remoteAddress);
    }

    async encrypt(paddedMessage: Buffer): Promise<CiphertextMessage> {
        let sessionRecord = await this._sessionStore.loadSession(this._remoteAddress);
        let sessionState = sessionRecord.sessionState;
        let chainKey = sessionState.getSenderChainKey();
        let messageKeys = chainKey.getMessageKeys();
        let senderEphemeral = sessionState.getSenderRatchetKey();
        let previousCounter = sessionState.previousCounter;
        let sessionVersion = sessionState.sessionVersion;

        let ciphertextBody = this.getCiphertext(messageKeys, paddedMessage);
        let ciphertextMessage: CiphertextMessage = SignalMessage.Create(
            sessionVersion,
            messageKeys.macKey,
            senderEphemeral,
            chainKey.index,
            previousCounter,
            ciphertextBody,
            sessionState.localIdentityKey,
            sessionState.remoteIdentityKey
        );

        if (sessionState.hasUnacknowledgedPreKeyMessage()) {
            let items = sessionState.getUnacknowledgedPreKeyMessageItems();
            let localRegistrationId = sessionState.getLocalRegistrationId();
            ciphertextMessage = PreKeySignalMessage.Create(
                sessionVersion,
                localRegistrationId,
                items.preKeyId,
                items.signedPreKeyId,
                items.baseKey,
                sessionState.localIdentityKey,
                ciphertextMessage);
        }

        sessionState.setSenderChainKey(chainKey.getNextChainKey());

        if (!await this._identityKeyStore.isTrustedIdentity(this._remoteAddress, sessionState.remoteIdentityKey, Direction.SENDING)) {
            console.error('dra: 证书错误不能加密');
            return null;
        }

        await this._identityKeyStore.saveIdentity(this._remoteAddress, sessionState.remoteIdentityKey);
        await this._sessionStore.storeSession(this._remoteAddress, sessionRecord);

        return ciphertextMessage;
    }

    async decryptPreKey(ciphertext: PreKeySignalMessage): Promise<Buffer> {
        let sessionRecord = await this._sessionStore.loadSession(this._remoteAddress);
        let unsignedPreKeyId = await this._sessionBuilder.process(sessionRecord, ciphertext);
        let plaintext = await this.decrypt(sessionRecord, ciphertext.whisperMessage);

        await this._sessionStore.storeSession(this._remoteAddress, sessionRecord);
        if (unsignedPreKeyId != null) {
            await this._preKeyStore.removePreKey(unsignedPreKeyId);
        }

        return plaintext;
    }

    async decryptMessage(ciphertext: SignalMessage): Promise<Buffer> {
        if (!await this._sessionStore.containsSession(this._remoteAddress)) {
            console.error('dra: 不存在session');
            return null;
        }

        let sessionRecord = await this._sessionStore.loadSession(this._remoteAddress);
        let plaintext = await this.decryptByRecord(sessionRecord, ciphertext);

        if (!await this._identityKeyStore.isTrustedIdentity(this._remoteAddress, sessionRecord.sessionState.remoteIdentityKey, Direction.RECEIVING)) {
            console.error('dra: 证书错误');
            return null;
        }

        await this._identityKeyStore.saveIdentity(this._remoteAddress, sessionRecord.sessionState.remoteIdentityKey);
        await this._sessionStore.storeSession(this._remoteAddress, sessionRecord);

        return plaintext;
    }

    private async decryptByRecord(sessionRecord: SessionRecord, ciphertext: SignalMessage): Promise<Buffer> {
        try {
            let sessionState = SessionState.CreateByState(sessionRecord.sessionState);
            let plaintext = this.decryptByState(sessionState, ciphertext);
            sessionRecord.setState(sessionState);
            return plaintext;
        } catch (e) {
            // 继续尝试
        }

        let previousSessionStates = sessionRecord.previousSessionStates.concat();
        for (let i = 0; i < previousSessionStates.length; ++i) {
            try {
                let cur = previousSessionStates[i];
                let promotedState = SessionState.CreateByState(cur);
                let plaintext = this.decryptByState(promotedState, ciphertext);
                ArrayT.RemoveObject(sessionRecord.previousSessionStates, cur);
                sessionRecord.promoteState(promotedState);
                return plaintext;
            } catch (e) {
                // 继续
            }
        }

        return null;
    }

    private async decryptByState(sessionState: SessionState, ciphertext: SignalMessage): Promise<Buffer> {
        if (!sessionState.hasSenderChain()) {
            throw new Error('dra: 未初始化session');
        }

        if (ciphertext.messageVersion != sessionState.sessionVersion) {
            throw  new Error('dra: 不支持该版本消息');
        }

        let theirEphemeral = ciphertext.senderRatcherKey;
        let counter = ciphertext.counter;
        let chainKey = await this.getOrCreateChainKey(sessionState, theirEphemeral);
        let messageKeys = await this.getOrCreateMessageKeys(sessionState, theirEphemeral, chainKey, counter);

        ciphertext.verifyMac(sessionState.remoteIdentityKey, sessionState.localIdentityKey, messageKeys.macKey);

        let plaintext = this.getPlaintext(messageKeys, ciphertext.body);
        sessionState.clearUnacknowledgedPreKeyMessage();

        return plaintext;
    }

    async getRemoteRegistrationId(): Promise<number> {
        let record = await this._sessionStore.loadSession(this._remoteAddress);
        return record.sessionState.getRemoteRegistrationId();
    }

    async getSessionVersion(): Promise<number> {
        if (!await this._sessionStore.containsSession(this._remoteAddress)) {
            throw new Error(`dra: 没有session ${this._remoteAddress}`);
        }

        let record = await this._sessionStore.loadSession(this._remoteAddress);
        return record.sessionState.sessionVersion;
    }

    private getOrCreateChainKey(sessionState: SessionState, theirEphemeral: PublicKey): ChainKey {
        if (sessionState.hasReceiverChain(theirEphemeral)) {
            return sessionState.getReceiverChainKey(theirEphemeral);
        }

        let rootKey = sessionState.getRootKey();
        let ourEphemeral = sessionState.getSenderRatchetKeyPair();
        let receiverChain = rootKey.createChain(theirEphemeral, ourEphemeral);
        let ourNewEphemeral = Crypto.GenerateKeyPair();
        let senderChain = receiverChain[0].createChain(theirEphemeral, ourNewEphemeral);

        sessionState.setRootKey(senderChain[0]);
        sessionState.addReceiverChain(theirEphemeral, receiverChain[1]);
        sessionState.previousCounter = Math.max(sessionState.getSenderChainKey().index - 1, 0);
        sessionState.setSenderChain(ourNewEphemeral, senderChain[1]);

        return receiverChain[1];
    }

    private getOrCreateMessageKeys(sessionState: SessionState, theirEphemeral: PublicKey, chainKey: ChainKey, counter: number): MessageKeys {
        if (chainKey.index > counter) {
            if (sessionState.hasMessageKeys(theirEphemeral, counter)) {
                return sessionState.removeMessageKeys(theirEphemeral, counter);
            } else {
                throw new Error('dra: 重复收到消息');
            }
        }

        if (counter - chainKey.index > 2000) {
            throw new Error('dra: 收到了超出计算范围的消息');
        }

        while (chainKey.index < counter) {
            let messageKeys = chainKey.getMessageKeys();
            sessionState.setMessageKeys(theirEphemeral, messageKeys);
            chainKey = chainKey.getNextChainKey();
        }

        sessionState.setReceiverChainKey(theirEphemeral, chainKey.getNextChainKey());
        return chainKey.getMessageKeys();
    }

    private getCiphertext(messageKeys: MessageKeys, plaintext: Buffer): Buffer {
        let cry = crypto.createCipheriv('aes-128-cbc', messageKeys.cipherKey.pub.forSerialize.buffer, messageKeys.iv.buffer);
        cry.update(plaintext);
        return cry.final();
    }

    private getPlaintext(messageKeys: MessageKeys, cipherText: Buffer): Buffer {
        let cry = crypto.createDecipheriv('aes-128-cbc', messageKeys.cipherKey.pub.forSerialize.buffer, messageKeys.iv.buffer);
        cry.update(cipherText);
        return cry.final();
    }
}