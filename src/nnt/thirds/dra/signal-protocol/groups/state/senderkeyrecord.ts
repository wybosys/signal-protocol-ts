import {SenderKeyState} from "./senderkeystate";
import {SenderKeyRecordStructureModel} from "../../model/localstorage";
import {ArrayT} from "../../../../../core/arrayt";
import {KeyPair, PublicKey} from "../../keypair";
import {ISerializableObject} from "../../../../../core/object";

export class SenderKeyRecord implements ISerializableObject {

    static MAX_STATES = 5;

    private _senderKeyStates: SenderKeyState[] = [];

    constructor() {
    }

    static Deserialize(serialized: Buffer): SenderKeyRecord {
        let senderKeyRecordStructure = new SenderKeyRecordStructureModel().deserialize(serialized);

        let r = new SenderKeyRecord();
        senderKeyRecordStructure.senderKeyStates.forEach(e => {
            r._senderKeyStates.push(SenderKeyState.CreateByState(e));
        });

        return r;
    }

    isEmpty() {
        return this._senderKeyStates.length == 0;
    }

    getSenderKeyState(): SenderKeyState {
        if (this._senderKeyStates.length)
            return this._senderKeyStates[0];
        throw new Error('dra: 不存在keystate');
    }

    getSenderKeyStateById(keyId: number): SenderKeyState {
        let fnd = ArrayT.QueryObject(this._senderKeyStates, e => {
            return e.keyId == keyId;
        });
        if (fnd)
            return fnd;
        throw new Error(`dra: 不存在key ${keyId}`);
    }

    addSenderKeyState(id: number, iteration: number, chainKey: Buffer, signatureKey: PublicKey) {
        ArrayT.InsertObjectAtIndex(this._senderKeyStates, SenderKeyState.CreateByKey(id, iteration, chainKey, signatureKey), 0);

        if (this._senderKeyStates.length > SenderKeyRecord.MAX_STATES) {
            this._senderKeyStates.pop();
        }
    }

    setSenderKeyState(id: number, iteration: number, chainKey: Buffer, signatureKey: KeyPair) {
        this._senderKeyStates.length = 0;
        this._senderKeyStates.push(SenderKeyState.CreateByKeyPair(id, iteration, chainKey, signatureKey));
    }

    serialize(): Buffer {
        let recordStructure = new SenderKeyRecordStructureModel();
        this._senderKeyStates.forEach(e => {
            recordStructure.senderKeyStates.push(e.structure);
        });
        return recordStructure.serialize();
    }

    deserialize(buf: Buffer): this {
        return null;
    }
}