import {IdentityKey, IdentityKeyPair} from "../keypair";
import {Address} from "../address";

export enum Direction {
    SENDING = 0,
    RECEIVING = 1
}

export interface IdentityKeyStore {

    getIdentityKeyPair(): Promise<IdentityKeyPair>;

    getLocalRegistrationId(): Promise<number>;

    saveIdentity(address: Address, identityKey: IdentityKey): Promise<boolean>;

    isTrustedIdentity(address: Address, identityKey: IdentityKey, direction: Direction): Promise<boolean>;

    getIdentity(address: Address): Promise<IdentityKey>;
}