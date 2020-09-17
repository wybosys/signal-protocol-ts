import {Model} from "./model";
import {IEqualableObject, IHashObject} from "../../../../core/object";
import {IndexedObject} from "../../../../core/kernel";
import {PublicKey} from "./publickey";

export class IdentityKey extends Model implements IEqualableObject, IHashObject {

    private _publicKey: PublicKey;

    constructor(key?: PublicKey) {
        super();
        this._publicKey = key;
    }

    get publicKey() {
        return this._publicKey;
    }

    toPod(): IndexedObject {
        return {
            key: this._publicKey?.serialize()
        };
    }

    fromPod(obj: IndexedObject): this {
        if (obj.key)
            this._publicKey = new PublicKey().deserialize(obj.key);
        return this;
    }

    fingerprint() {
        return this.publicKey.serialize().toString('hex');
    }

    isEqual(r: this): boolean {
        return this._publicKey.isEqual(r._publicKey);
    }

    get hash(): number {
        return this._publicKey.hash;
    }
}

