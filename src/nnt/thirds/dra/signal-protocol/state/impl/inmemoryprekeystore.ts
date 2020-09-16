import {PreKeyStore} from "../prekeystore";
import {PreKeyRecord} from "../prekeyrecord";

export class InMemoryPreKeyStore implements PreKeyStore {

    private _store = new Map<number, Buffer>();

    async loadPreKey(preKeyId: number): Promise<PreKeyRecord> {
        if (!this._store.has(preKeyId)) {
            throw new Error('dra: 没有找到证书');
        }

        return PreKeyRecord.Deserialize(this._store.get(preKeyId));
    }

    async storePreKey(preKeyId: number, record: PreKeyRecord): Promise<void> {
        this._store.set(preKeyId, record.serialize());
    }

    async containsPreKey(preKeyId: number): Promise<boolean> {
        return this._store.has(preKeyId);
    }

    async removePreKey(preKeyId: number): Promise<void> {
        this._store.delete(preKeyId);
    }
}