import {IndexedObject} from "../../../../core/kernel";
import {Model} from "./model";

export class LogicalFingerprintModel extends Model {

    content: Buffer;

    toPod(): IndexedObject {
        return {
            content: this.content
        };
    }

    fromPod(obj: IndexedObject): this {
        this.content = obj.content;
        return this;
    }
}

export class CombinedFingerprintsModel extends Model {

    version: number;
    local: LogicalFingerprintModel;
    remote: LogicalFingerprintModel;

    toPod(): IndexedObject {
        return {
            version: this.version,
            local: this.local?.toPod(),
            remote: this.remote?.toPod()
        };
    }

    fromPod(obj: IndexedObject): this {
        this.version = obj.version;
        if (obj.local)
            this.local = new LogicalFingerprintModel().fromPod(obj.local);
        if (obj.remote)
            this.remote = new LogicalFingerprintModel().fromPod(obj.remote);
        return this;
    }
}
