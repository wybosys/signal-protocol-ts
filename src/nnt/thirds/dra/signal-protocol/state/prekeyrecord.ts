import {PreKeyRecordStructureModel} from "../model/localstorage";
import {KeyPair} from "../keypair";
import {use} from "../../../../core/kernel";
import {ISerializableObject} from "../../../../core/object";

export class PreKeyRecord implements ISerializableObject {

    private _structure: PreKeyRecordStructureModel;

    private constructor() {
    }

    static Create(id: number, keyPair: KeyPair): PreKeyRecord {
        let r = new PreKeyRecord();
        r._structure = use(new PreKeyRecordStructureModel(), m => {
            m.id = id;
            m.key = keyPair;
        });
        return r;
    }

    static Deserialize(serialized: Buffer): PreKeyRecord {
        let r = new PreKeyRecord();
        r._structure = new PreKeyRecordStructureModel().deserialize(serialized);
        return r;
    }

    get id() {
        return this._structure.id;
    }

    get keyPair() {
        return this._structure.key;
    }

    serialize(): Buffer {
        return this._structure.serialize();
    }

    deserialize(buf: Buffer): this {
        return null;
    }
}