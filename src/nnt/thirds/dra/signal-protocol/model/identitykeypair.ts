import {PublicKey} from "./publickey";
import {PrivateKey} from "./privatekey";
import {Model} from "./model";
import {IndexedObject} from "../../../../core/kernel";

export class IdentityKeyPair extends Model {

    private _publicKey: PublicKey;
    private _privateKey: PrivateKey;

    constructor(pub: PublicKey, prv: PrivateKey) {
        super();
        this._publicKey = pub;
        this._privateKey = prv;
    }

    get publicKey() {
        return this._publicKey;
    }

    get privateKey() {
        return this._privateKey;
    }

    toPod(): IndexedObject {
        return {
            pub: this._publicKey?.serialize(),
            prv: this._privateKey?.serialize()
        };
    }

    fromPod(obj: IndexedObject): this {
        if (obj.pub)
            this._publicKey = new PublicKey().deserialize(obj.pub);
        if (obj.prv)
            this._privateKey = new PrivateKey().deserialize(obj.prv);
        return this;
    }
}