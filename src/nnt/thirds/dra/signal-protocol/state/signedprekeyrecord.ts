import {SignedPreKeyRecordStructureModel} from "../model/localstorage";
import {KeyPair} from "../model/keypair";
import {SignatureBuffer} from "../crypto";
import {use} from "../../../../core/kernel";
import {ISerializableObject} from "../../../../core/object";

export class SignedPreKeyRecord implements ISerializableObject {

    private _structure: SignedPreKeyRecordStructureModel;

    private constructor() {
    }

    static Create(id: number, timestamp: number, keyPair: KeyPair, signature: SignatureBuffer): SignedPreKeyRecord {
        let r = new SignedPreKeyRecord();
        r._structure = use(new SignedPreKeyRecordStructureModel(), m => {
            m.id = id;
            m.key = keyPair;
            m.signature = signature;
            m.timestamp = timestamp;
        });
        return r;
    }

    static Deserialize(serialized: Buffer): SignedPreKeyRecord {
        let r = new SignedPreKeyRecord();
        r._structure = new SignedPreKeyRecordStructureModel().deserialize(serialized);
        return r;
    }

    get id() {
        return this._structure.id;
    }

    get timestamp() {
        return this._structure.timestamp;
    }

    get keyPair() {
        return this._structure.key;
    }

    get signature() {
        return this._structure.signature;
    }

    serialize(): Buffer {
        return this._structure.serialize();
    }

    deserialize(buf: Buffer): this {
        return null;
    }
}