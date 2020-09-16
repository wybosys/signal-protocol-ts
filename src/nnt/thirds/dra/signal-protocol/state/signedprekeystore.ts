import {SignedPreKeyRecord} from "./signedprekeyrecord";

export interface SignedPreKeyStore {

    loadSignedPreKey(signedPreKeyId: number): Promise<SignedPreKeyRecord>;

    loadSignedPreKeys(): Promise<SignedPreKeyRecord[]>;

    storeSignedPreKey(signedPreKeyId: number, record: SignedPreKeyRecord): Promise<void>;

    containsSignedPreKey(signedPreKeyId: number): Promise<boolean>;

    removeSignedPreKey(signedPreKeyId: number): Promise<void>;
}