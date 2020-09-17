import {Direction, IdentityKeyStore} from "../identitykeystore";
import {Address} from "../../address";
import {IdentityKey} from "../../model/identitykey";
import {IdentityKeyPair} from "../../model/identitykeypair";

export class InMemoryIdentityKeyStore implements IdentityKeyStore {

    private _trustedKeys = new Map<number, IdentityKey>();
    private _identityKeyPair: IdentityKeyPair;
    private _localRegistrationId: number;

    constructor(identityKeyPair: IdentityKeyPair, localRegistrationId: number) {
        this._identityKeyPair = identityKeyPair;
        this._localRegistrationId = localRegistrationId;
    }


    async getIdentityKeyPair(): Promise<IdentityKeyPair> {
        return this._identityKeyPair;
    }

    async getLocalRegistrationId(): Promise<number> {
        return this._localRegistrationId;
    }

    async saveIdentity(address: Address, identityKey: IdentityKey): Promise<boolean> {
        let existing = this._trustedKeys.get(address.hash);

        if (!identityKey.isEqual(existing)) {
            this._trustedKeys.set(address.hash, identityKey);
            return true;
        }

        return false;
    }

    async isTrustedIdentity(address: Address, identityKey: IdentityKey, direction: Direction): Promise<boolean> {
        let trusted = this._trustedKeys.get(address.hash);
        return trusted == null || trusted.isEqual(identityKey);
    }

    async getIdentity(address: Address): Promise<IdentityKey> {
        return this._trustedKeys.get(address.hash);
    }

}