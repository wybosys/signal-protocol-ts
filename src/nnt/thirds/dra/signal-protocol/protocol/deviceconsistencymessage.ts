import {DeviceConsistencySignature} from "../devices/deviceconsistencysignature";
import {ISerializableObject} from "../../../../core/object";
import {DeviceConsistencyCommitment} from "../devices/deviceconsistencycommitment";
import {Crypto} from "../crypto";
import {DeviceConsistencyCodeMessageModel} from "../model/whispertext";
import {IdentityKeyPair} from "../model/identitykeypair";


export class DeviceConsistencyMessage implements ISerializableObject {

    static Create(commitment: DeviceConsistencyCommitment, identityKeyPair: IdentityKeyPair): DeviceConsistencyMessage {
        let sign = Crypto.Sign(commitment.serialize(), identityKeyPair.privateKey);

        let r = new DeviceConsistencyMessage();
        r._generation = commitment.generation;
        r._signature = new DeviceConsistencySignature(sign);

        let t = new DeviceConsistencyCodeMessageModel();
        t.generation = r._generation;
        t.signature = sign;
        r._serialized = t.serialize();

        return r;
    }

    static Deserialize(commitment: DeviceConsistencyCommitment, serialized: Buffer): DeviceConsistencyMessage {
        let t = new DeviceConsistencyCodeMessageModel();
        t.deserialize(serialized);

        let r = new DeviceConsistencyMessage();
        r._generation = t.generation;
        r._signature = new DeviceConsistencySignature(t.signature);
        r._serialized = serialized;

        return r;
    }

    private _signature: DeviceConsistencySignature;
    private _generation: number;
    private _serialized: Buffer;

    serialize(): Buffer {
        return this._serialized;
    }

    deserialize(buf: Buffer): this {
        return null;
    }

    get signature() {
        return this._signature;
    }

    get generation() {
        return this._generation;
    }
}