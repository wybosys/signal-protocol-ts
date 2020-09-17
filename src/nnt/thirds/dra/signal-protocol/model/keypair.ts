import {IndexedObject} from "../../../../core/kernel";
import {PublicKey} from "./publickey";
import {PrivateKey} from "./privatekey";
import {Model} from "./model";

export class KeyPair extends Model {

    publicKey: PublicKey;
    privateKey: PrivateKey;

    toPod(): IndexedObject {
        return {
            pub: this.publicKey?.serialize(),
            priv: this.privateKey?.serialize()
        };
    }

    fromPod(obj: IndexedObject): this {
        if (obj.pub)
            this.publicKey = new PublicKey().deserialize(obj.pub);
        if (obj.priv)
            this.privateKey = new PrivateKey().deserialize(obj.priv);
        return this;
    }
}
