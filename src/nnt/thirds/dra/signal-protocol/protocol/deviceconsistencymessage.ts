import {DeviceConsistencySignature} from "../devices/deviceconsistencysignature";
import {ISerializableObject} from "../../../../core/object";


export class DeviceConsistencyMessage implements ISerializableObject {

    private _signature: DeviceConsistencySignature;
    private _generation: number;
    private _serialized: Buffer;

    serialize(): Buffer {
        return this._serialized;
    }

    unserialize(buf: Buffer): this {
        return null;
    }

    get signature() {
        return this._signature;
    }

    get generation() {
        return this._generation;
    }
}