import {PreKeyRecord} from "./prekeyrecord";

export interface PreKeyStore {

    loadPreKey(preKeyId: number): Promise<PreKeyRecord>;

    storePreKey(preKeyId: number, record: PreKeyRecord): Promise<void>;

    containsPreKey(preKeyId: number): Promise<boolean>;

    removePreKey(preKeyId: number): Promise<void>;

}
