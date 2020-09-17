import {ProtocolStore} from "../protocolstore";
import {InMemoryPreKeyStore} from "./inmemoryprekeystore";
import {InMemorySessionStore} from "./inmemorysessionstore";
import {InMemorySignedPreKeyStore} from "./inmemorysignedprekeystore";
import {InMemoryIdentityKeyStore} from "./inmemoryidentitykeystore";
import {IdentityKeyPair} from "../../model/identitykeypair";
import {Address} from "../../address";
import {PreKeyRecord} from "../prekeyrecord";
import {SessionRecord} from "../sessionrecord";
import {SignedPreKeyRecord} from "../signedprekeyrecord";
import {IdentityKey} from "../../model/identitykey";
import {Direction} from "../identitykeystore";

export class InMemoryProtocolStore implements ProtocolStore {

    private _preKeyStore = new InMemoryPreKeyStore()
    private _sessionStore = new InMemorySessionStore();
    private _signedPreKeyStore = new InMemorySignedPreKeyStore();
    private _identityKeyStore: InMemoryIdentityKeyStore;

    constructor(kp: IdentityKeyPair, registrationId: number) {
        this._identityKeyStore = new InMemoryIdentityKeyStore(kp, registrationId);
    }

    containsPreKey(preKeyId: number): Promise<boolean> {
        return this._preKeyStore.containsPreKey(preKeyId);
    }

    containsSession(address: Address): Promise<boolean> {
        return this._sessionStore.containsSession(address);
    }

    containsSignedPreKey(signedPreKeyId: number): Promise<boolean> {
        return this._signedPreKeyStore.containsSignedPreKey(signedPreKeyId);
    }

    deleteAllSessions(name: string): Promise<void> {
        return this._sessionStore.deleteAllSessions(name);
    }

    deleteSession(address: Address): Promise<void> {
        return this._sessionStore.deleteSession(address);
    }

    getLocalRegistrationId(): Promise<number> {
        return this._identityKeyStore.getLocalRegistrationId();
    }

    getSubDeviceSessions(name: string): Promise<number[]> {
        return this._sessionStore.getSubDeviceSessions(name);
    }

    loadPreKey(preKeyId: number): Promise<PreKeyRecord> {
        return this._preKeyStore.loadPreKey(preKeyId);
    }

    loadSession(address: Address): Promise<SessionRecord> {
        return this._sessionStore.loadSession(address);
    }

    loadSignedPreKey(signedPreKeyId: number): Promise<SignedPreKeyRecord> {
        return this._signedPreKeyStore.loadSignedPreKey(signedPreKeyId);
    }

    loadSignedPreKeys(): Promise<SignedPreKeyRecord[]> {
        return this._signedPreKeyStore.loadSignedPreKeys();
    }

    removePreKey(preKeyId: number): Promise<void> {
        return this._preKeyStore.removePreKey(preKeyId);
    }

    removeSignedPreKey(signedPreKeyId: number): Promise<void> {
        return this._signedPreKeyStore.removeSignedPreKey(signedPreKeyId);
    }

    storePreKey(preKeyId: number, record: PreKeyRecord): Promise<void> {
        return this._preKeyStore.storePreKey(preKeyId, record);
    }

    storeSession(address: Address, record: SessionRecord): Promise<void> {
        return this._sessionStore.storeSession(address, record);
    }

    storeSignedPreKey(signedPreKeyId: number, record: SignedPreKeyRecord): Promise<void> {
        return this._signedPreKeyStore.storeSignedPreKey(signedPreKeyId, record);
    }

    getIdentity(address: Address): Promise<IdentityKey> {
        return this._identityKeyStore.getIdentity(address);
    }

    getIdentityKeyPair(): Promise<IdentityKeyPair> {
        return this._identityKeyStore.getIdentityKeyPair();
    }

    isTrustedIdentity(address: Address, identityKey: IdentityKey, direction: Direction): Promise<boolean> {
        return this._identityKeyStore.isTrustedIdentity(address, identityKey, direction);
    }

    saveIdentity(address: Address, identityKey: IdentityKey): Promise<boolean> {
        return this._identityKeyStore.saveIdentity(address, identityKey);
    }

}