import {IPodObject, ISerializableObject} from "../../../../core/object";
import {toJson, toJsonObject} from "../../../../core/json";
import {IndexedObject} from "../../../../core/kernel";

export abstract class Model implements IPodObject, ISerializableObject {

    serialize(): Buffer {
        return Buffer.from(toJson(this.toPod()), 'utf8');
    }

    deserialize(buf: Buffer): this {
        let o = toJsonObject(buf.toString('utf8'));
        if (!o)
            return null;
        this.fromPod(o);
        return this;
    }

    abstract toPod(): IndexedObject;

    abstract fromPod(obj: IndexedObject): this;
}
