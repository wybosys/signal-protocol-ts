import {SignedPreKeyStore} from "../signedprekeystore";
import {SignedPreKeyRecord} from "../signedprekeyrecord";

export class InMemorySignedPreKeyStore implements SignedPreKeyStore {

    private _store = new Map<number, Buffer>();

    async loadSignedPreKey(signedPreKeyId: number): Promise<SignedPreKeyRecord> {
        if (!this._store.has(signedPreKeyId)) {
            throw new Error(`dra: 没有找到签名`);
        }

        return SignedPreKeyRecord.Deserialize(this._store.get(signedPreKeyId));
    }

    async loadSignedPreKeys(): Promise<SignedPreKeyRecord[]> {
        let results: SignedPreKeyRecord[] = [];

        this._store.forEach(v => {
            results.push(SignedPreKeyRecord.Deserialize(v));
        });

        return results;
    }

    async storeSignedPreKey(signedPreKeyId: number, record: SignedPreKeyRecord): Promise<void> {
        this._store.set(signedPreKeyId, record.serialize());
    }

    async containsSignedPreKey(signedPreKeyId: number): Promise<boolean> {
        return this._store.has(signedPreKeyId);
    }

    async removeSignedPreKey(signedPreKeyId: number): Promise<void> {
        this._store.delete(signedPreKeyId);
    }

}