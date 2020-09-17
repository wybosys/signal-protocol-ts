import {Address} from "../address";
import {IEqualableObject, IHashObject, ISerializableObject} from "../../../../core/object";
import {StringT} from "../../../../core/stringt";

export class SenderKeyName implements ISerializableObject, IEqualableObject, IHashObject {

    private _groupId: string;
    private _sender: Address;
    private _hash: number;

    constructor(groupId: string, sender: Address) {
        this._groupId = groupId;
        this._sender = sender;
        this._hash = StringT.Hash(`${this._groupId}::${this._sender.name}::${this._sender.deviceId}`);
    }

    get groupId() {
        return this._groupId;
    }

    get sender() {
        return this._sender;
    }

    serialize(): Buffer {
        return Buffer.from(`${this._groupId}::${this._sender.name}::${this._sender.deviceId}`);
    }

    deserialize(buf: Buffer): this {
        return null;
    }

    isEqual(r: this): boolean {
        return this._groupId == r._groupId &&
            this._sender.isEqual(r._sender);
    }

    get hash(): number {
        return this._hash;
    }
}