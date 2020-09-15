import {IPodObject} from "../../../../core/object";
import {toJson, toJsonObject} from "../../../../core/json";
import {IndexedObject} from "../../../../core/kernel";

export abstract class Model implements IPodObject {

    serialout = (): Buffer => {
        return Buffer.from(toJson(this.toPod()), 'utf8');
    }

    serialin = (data: Buffer): this => {
        let o = toJsonObject(data.toString('utf8'));
        if (!o)
            return null;
        this.fromPod(o);
        return this;
    }

    abstract toPod(): IndexedObject;

    abstract fromPod(obj: IndexedObject): this;
}
