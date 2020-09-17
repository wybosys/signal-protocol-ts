import {SessionStore} from "./state/sessionstore";
import {PreKeyStore} from "./state/prekeystore";
import {SignedPreKeyStore} from "./state/signedprekeystore";
import {Direction, IdentityKeyStore} from "./state/identitykeystore";
import {Address} from "./address";
import {ProtocolStore} from "./state/protocolstore";
import {SessionRecord} from "./state/sessionrecord";
import {PreKeySignalMessage} from "./protocol/prekeysignalmessage";
import {use} from "../../../core/kernel";
import {BobParameters} from "./ratchet/bobparameters";
import {IdentityKeyPair} from "./model/keypair";
import {RatchetingSession} from "./ratchet/ratchetingsession";
import {PreKeyBundle} from "./state/prekeybundle";
import {Crypto} from "./crypto";
import {AliceParameters} from "./ratchet/aliceparameters";

export class SessionBuilder {

    private _sessionStore: SessionStore;
    private _preKeyStore: PreKeyStore;
    private _signedPreKeyStore: SignedPreKeyStore;
    private _identityKeyStore: IdentityKeyStore;
    private _remoteAddress: Address;

    private constructor() {
    }

    static Create(sessionStore: SessionStore, preKeyStore: PreKeyStore, signedPreKeyStore: SignedPreKeyStore, identityKeyStore: IdentityKeyStore, remoteAddress: Address): SessionBuilder {
        let r = new SessionBuilder();
        r._sessionStore = sessionStore;
        r._preKeyStore = preKeyStore;
        r._signedPreKeyStore = signedPreKeyStore;
        r._identityKeyStore = identityKeyStore;
        r._remoteAddress = remoteAddress;
        return r;
    }

    static CreateByProtocolStore(store: ProtocolStore, remoteAddress: Address): SessionBuilder {
        return this.Create(store, store, store, store, remoteAddress);
    }

    async process(sessionRecord: SessionRecord, message: PreKeySignalMessage): Promise<number> {
        let theirIdentityKey = message.identityKey;
        if (!await this._identityKeyStore.isTrustedIdentity(this._remoteAddress, theirIdentityKey, Direction.RECEIVING)) {
            console.error(`dra: 错误的证书`);
            return null;
        }

        let unsignedPreKeyId = await this.processv3(sessionRecord, message);
        await this._identityKeyStore.saveIdentity(this._remoteAddress, theirIdentityKey);

        return unsignedPreKeyId;
    }

    async processv3(sessionRecord: SessionRecord, message: PreKeySignalMessage): Promise<number> {
        if (sessionRecord.hasSessionState(message.messageVersion, message.baseKey.serialize())) {
            console.error('dra: 不受信任的这个证书');
            return null;
        }

        let ourSignedPreKey = (await this._signedPreKeyStore.loadSignedPreKey(message.signedPreKeyId)).keyPair;

        let parameters = new BobParameters();
        parameters.theirBaseKey = message.baseKey;
        parameters.theirIdentityKey = use(new IdentityKeyPair(), kp => {
            kp.pub = message.identityKey;
        });
        parameters.ourIdentityKey = await this._identityKeyStore.getIdentityKeyPair();
        parameters.ourSignedPreKey = ourSignedPreKey;
        parameters.ourRatchetKey = ourSignedPreKey;

        if (message.preKeyId != null) {
            parameters.ourOneTimePreKey = (await this._preKeyStore.loadPreKey(message.preKeyId)).keyPair;
        } else {
            parameters.ourOneTimePreKey = null;
        }

        if (!sessionRecord.isFresh()) {
            sessionRecord.archiveCurrentState();
        }

        RatchetingSession.InitBobSession(sessionRecord.sessionState, parameters);

        sessionRecord.sessionState.setLocalRegistrationId(await this._identityKeyStore.getLocalRegistrationId());
        sessionRecord.sessionState.setRemoteRegistrationId(message.registrationId);
        sessionRecord.sessionState.aliceBaseKey = message.baseKey;

        if (message.preKeyId != null) {
            return message.preKeyId;
        }

        return null;
    }

    async processPreKeyBundle(preKey: PreKeyBundle) {
        if (!await this._identityKeyStore.isTrustedIdentity(this._remoteAddress, preKey.identityKey, Direction.SENDING)) {
            console.error('dra: 不受信任的这个证书');
            return;
        }

        if (preKey.signedPreKey != null &&
            !Crypto.VerifySign(preKey.identityKey.key.forSerialize.buffer, preKey.signedPreKeySignature, preKey.signedPreKey)) {
            console.error('dra: 签名验证失败');
            return;
        }

        if (preKey.signedPreKey == null) {
            console.error('dra: 没有找到签名证书');
            return;
        }

        let sessionRecord = await this._sessionStore.loadSession(this._remoteAddress);
        let ourBaseKey = Crypto.GenerateKeyPair();
        let theirSignedPreKey = preKey.signedPreKey;
        let theirOneTimePreKey = preKey.preKey;
        let theirOneTimePreKeyId = theirOneTimePreKey ? preKey.preKeyId : null;

        let parameters = new AliceParameters();
        parameters.ourBaseKey = ourBaseKey;
        parameters.ourIdentityKey = await this._identityKeyStore.getIdentityKeyPair();
        parameters.theirIdentityKey = preKey.identityKey;
        parameters.theirSignedPreKey = theirSignedPreKey;
        parameters.theirRatchetKey = theirSignedPreKey;
        parameters.theirOneTimePreKey = theirOneTimePreKey;

        if (!sessionRecord.isFresh()) {
            sessionRecord.archiveCurrentState();
        }

        RatchetingSession.InitAliceSession(sessionRecord.sessionState, parameters);

        sessionRecord.sessionState.setUnacknowledgedPreKeyMessage(theirOneTimePreKeyId, preKey.signedPreKeyId, ourBaseKey.pub);
        sessionRecord.sessionState.setLocalRegistrationId(await this._identityKeyStore.getLocalRegistrationId());
        sessionRecord.sessionState.setRemoteRegistrationId(preKey.registrationId);
        sessionRecord.sessionState.aliceBaseKey = ourBaseKey.pub;

        await this._identityKeyStore.saveIdentity(this._remoteAddress, preKey.identityKey);
        await this._sessionStore.storeSession(this._remoteAddress, sessionRecord);
    }

}