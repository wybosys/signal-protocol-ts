import {IEqualableObject} from "../../../core/object";
import {StringT} from "../../../core/stringt";

export class Address implements IEqualableObject {

    private _name: string;
    private _deviceId: number;
    private _hash: number;

    constructor(name: string, deviceId: number) {
        this._name = name;
        this._deviceId = deviceId;
        this._hash = StringT.Hash(this.toString());
    }

    get name() {
        return this._name;
    }

    get deviceId() {
        return this._deviceId;
    }

    toString() {
        return `${this._name}.${this._deviceId}`;
    }

    isEqual(r: this): boolean {
        if (!r)
            return false;
        return this._name == r._name && this._deviceId == r._deviceId;
    }

    get hash() {
        return this._hash;
    }
}