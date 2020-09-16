import {
    ChainKeyModel,
    ChainModel,
    MessageKeyModel,
    PendingKeyExchangeModel,
    PendingPreKeyModel,
    SessionStructureModel
} from "../model/localstorage";
import {IdentityKeyPair, KeyPair, PublicKey} from "../keypair";
import {RootKey} from "../ratchet/rootkey";
import {HKDF} from "../kdf/HKDF";
import {make_tuple2, tuple2, use} from "../../../../core/kernel";
import {ChainKey} from "../ratchet/chainkey";
import {ArrayT} from "../../../../core/arrayt";
import {MessageKeys} from "../ratchet/messagekeys";
import {ISerializableObject} from "../../../../core/object";

const MAX_MESSAGE_KEYS = 2000;

export class SessionState implements ISerializableObject {

    private _sessionStructure: SessionStructureModel;

    static Create(): SessionState {
        let r = new SessionState();
        r._sessionStructure = new SessionStructureModel();
        return r;
    }

    static CreateByStructure(sessionStructure: SessionStructureModel) {
        let r = new SessionState();
        r._sessionStructure = sessionStructure;
        return r;
    }

    static CreateByState(copy: SessionState) {
        let r = new SessionState();
        r._sessionStructure = new SessionStructureModel().deserialize(copy._sessionStructure.serialize());
        return r;
    }

    get structure() {
        return this._sessionStructure;
    }

    get aliceBaseKey() {
        return this._sessionStructure.aliceBaseKey;
    }

    set aliceBaseKey(aliceBaseKey: PublicKey) {
        this._sessionStructure.aliceBaseKey = aliceBaseKey;
    }

    set sessionVersion(version: number) {
        this._sessionStructure.sessionVersion = version;
    }

    get sessionVersion() {
        let version = this._sessionStructure.sessionVersion;
        return version == 0 ? 2 : version;
    }

    set remoteIdentityKey(identityKey: PublicKey) {
        this._sessionStructure.remoteIdentity = identityKey;
    }

    set localIdentityKey(identityKey: PublicKey) {
        this._sessionStructure.localIdentity = identityKey;
    }

    get remoteIdentityKey(): PublicKey {
        return this._sessionStructure.remoteIdentity;
    }

    get localIdentityKey(): PublicKey {
        return this._sessionStructure.localIdentity;
    }

    get previousCounter() {
        return this._sessionStructure.previousCounter;
    }

    set previousCounter(v: number) {
        this._sessionStructure.previousCounter = v;
    }

    getRootKey() {
        return new RootKey(HKDF.CreateFor(this.sessionVersion), this._sessionStructure.rootKey);
    }

    setRootKey(rootKey: RootKey) {
        this._sessionStructure.rootKey = rootKey.keyBytes;
    }

    getSenderRatchetKey() {
        return this._sessionStructure.senderChain.senderRatchetKey.pub;
    }

    getSenderRatchetKeyPair() {
        return this._sessionStructure.senderChain.senderRatchetKey;
    }

    hasReceiverChain(senderEphemeral: PublicKey) {
        return this.getReceiverChain(senderEphemeral) != null;
    }

    hasSenderChain() {
        return this._sessionStructure.senderChain != null;
    }

    getReceiverChain(senderEphemeral: PublicKey): tuple2<ChainModel, number> {
        let receiverChains = this._sessionStructure.receiverChains;

        for (let i = 0; i < receiverChains.length; ++i) {
            let receiverChain = receiverChains[i];
            let chainSenderRatchetKey = receiverChain.senderRatchetKey.pub;
            if (chainSenderRatchetKey.compare(senderEphemeral) == 0) {
                return make_tuple2(receiverChain, i);
            }
        }

        return null;
    }

    getReceiverChainKey(senderEphemeral: PublicKey): ChainKey {
        let receiverChainAndIndex = this.getReceiverChain(senderEphemeral);
        let receiverChain = receiverChainAndIndex[0];
        if (receiverChain == null) {
            return null;
        }

        return new ChainKey(HKDF.CreateFor(this.sessionVersion), receiverChain.chainKey.key, receiverChain.chainKey.index);
    }

    addReceiverChain(senderRatchetKey: PublicKey, chainKey: ChainKey) {
        let chainKeyStructure = use(new ChainKeyModel(), m => {
            m.key = chainKey.key;
            m.index = chainKey.index;
        });

        let chain = use(new ChainModel(), m => {
            m.chainKey = chainKeyStructure;
            m.senderRatchetKey = use(new KeyPair(), kp => {
                kp.pub = senderRatchetKey;
            });
        });

        this._sessionStructure.receiverChains.push(chain);
        if (this._sessionStructure.receiverChains.length > 5) {
            ArrayT.RemoveObjectAtIndex(this._sessionStructure.receiverChains, 0);
        }
    }

    setSenderChain(senderRatchetKeyPair: KeyPair, chainKey: ChainKey) {
        let chainKeyStructure = use(new ChainKeyModel(), m => {
            m.key = chainKey.key;
            m.index = chainKey.index;
        });

        let senderChain = use(new ChainModel(), m => {
            m.senderRatchetKey = senderRatchetKeyPair;
            m.chainKey = chainKeyStructure;
        });

        this._sessionStructure.senderChain = senderChain;
    }

    getSenderChainKey() {
        let chainKeyStructure = this._sessionStructure.senderChain.chainKey;
        return new ChainKey(HKDF.CreateFor(this.sessionVersion), chainKeyStructure.key, chainKeyStructure.index);
    }

    setSenderChainKey(nextChainKey: ChainKey) {
        let chainKey = use(new ChainKeyModel(), m => {
            m.key = nextChainKey.key;
            m.index = nextChainKey.index;
        });

        this._sessionStructure.senderChain.chainKey = chainKey;
    }

    hasMessageKeys(senderEphemeral: PublicKey, counter: number): boolean {
        let chainAndIndex = this.getReceiverChain(senderEphemeral);
        let chain = chainAndIndex[0];
        if (chain == null)
            return false;

        let messageKeyList = chain.messageKeys;
        for (let i = 0; i < messageKeyList.length; ++i) {
            let messageKey = messageKeyList[i];
            if (messageKey.index == counter)
                return true;
        }

        return false;
    }

    removeMessageKeys(senderEphemeral: PublicKey, counter: number): MessageKeys {
        let chainAndIndex = this.getReceiverChain(senderEphemeral);
        let chain = chainAndIndex[0];
        if (chain == null)
            return null;
        let result: MessageKeys = null;

        let messageKeyList = chain.messageKeys;
        for (let i = 0; i < messageKeyList.length; ++i) {
            let messageKey = messageKeyList[i];
            if (messageKey.index == counter) {
                result = new MessageKeys(messageKey.cipherKey, messageKey.macKey, messageKey.iv, messageKey.index);
                ArrayT.RemoveObjectAtIndex(messageKeyList, i);
                break;
            }
        }

        return result;
    }

    setMessageKeys(senderEphemeral: PublicKey, messageKeys: MessageKeys) {
        let chainAndIndex = this.getReceiverChain(senderEphemeral);
        let chain = chainAndIndex[0];
        let messageKeyStructure = use(new MessageKeyModel(), m => {
            m.cipherKey = messageKeys.cipherKey;
            m.macKey = messageKeys.macKey;
            m.iv = messageKeys.iv;
            m.index = messageKeys.counter;
        });

        chain.messageKeys.push(messageKeyStructure);
    }

    setReceiverChainKey(senderEphemeral: PublicKey, chainKey: ChainKey) {
        let chainAndIndex = this.getReceiverChain(senderEphemeral);
        let chain = chainAndIndex[0];
        let chainKeyStructure = use(new ChainKeyModel(), m => {
            m.key = chainKey.key;
            m.index = chainKey.index;
        });

        chain.chainKey = chainKeyStructure;
    }

    setPendingKeyExchange(sequence: number, ourBaseKey: KeyPair, ourRatchetKey: KeyPair, ourIdentityKey: IdentityKeyPair) {
        let structure = use(new PendingKeyExchangeModel(), m => {
            m.sequence = sequence;
            m.localBaseKey = ourBaseKey;
            m.localRatchetKey = ourRatchetKey;
            m.localIdentityKey = ourIdentityKey;
        });

        this._sessionStructure.pendingKeyExchange = structure;
    }

    getPendingKeyExchangeSequence() {
        return this._sessionStructure.pendingKeyExchange.sequence;
    }

    getPendingKeyExchangeBaseKey(): KeyPair {
        return this._sessionStructure.pendingKeyExchange.localBaseKey;
    }

    getPendingKeyExchangeRatchetKey(): KeyPair {
        return this._sessionStructure.pendingKeyExchange.localRatchetKey;
    }

    getPendingKeyExchangeIdentityKey(): IdentityKeyPair {
        return this._sessionStructure.pendingKeyExchange.localIdentityKey;
    }

    hasPendingKeyExchange() {
        return this._sessionStructure.pendingKeyExchange != null;
    }

    setUnacknowledgedPreKeyMessage(preKeyId: number, signedPreKeyId: number, baseKey: PublicKey) {
        let pending = use(new PendingPreKeyModel(), m => {
            m.signedPreKeyId = signedPreKeyId;
            m.baseKey = baseKey;
            m.preKeyId = preKeyId;
        });

        this._sessionStructure.pendingPreKey = pending;
    }

    hasUnacknowledgedPreKeyMessage() {
        return this._sessionStructure.pendingPreKey != null;
    }

    getUnacknowledgedPreKeyMessageItems(): UnacknowledgedPreKeyMessageItems {
        let preKeyId: number;
        if (this._sessionStructure.pendingPreKey.preKeyId != null) {
            preKeyId = this._sessionStructure.pendingPreKey.preKeyId;
        } else {
            preKeyId = null;
        }

        return new UnacknowledgedPreKeyMessageItems(preKeyId, this._sessionStructure.pendingPreKey.signedPreKeyId, this._sessionStructure.pendingPreKey.baseKey);
    }

    clearUnacknowledgedPreKeyMessage() {
        this._sessionStructure.pendingPreKey = null;
    }

    setRemoteRegistrationId(registrationId: number) {
        this._sessionStructure.remoteRegistrationId = registrationId;
    }

    getRemoteRegistrationId(): number {
        return this._sessionStructure.remoteRegistrationId;
    }

    setLocalRegistrationId(registrationId: number) {
        this._sessionStructure.localRegistrationId = registrationId;
    }

    getLocalRegistrationId(): number {
        return this._sessionStructure.localRegistrationId;
    }

    serialize(): Buffer {
        return this._sessionStructure.serialize();
    }

    deserialize(buf: Buffer): this {
        return null;
    }
}

class UnacknowledgedPreKeyMessageItems {

    private _preKeyId: number;
    private _signedPreKeyId: number;
    private _baseKey: PublicKey;

    constructor(preKeyId: number, signedPreKeyId: number, baseKey: PublicKey) {
        this._preKeyId = preKeyId;
        this._signedPreKeyId = signedPreKeyId;
        this._baseKey = baseKey;
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
}