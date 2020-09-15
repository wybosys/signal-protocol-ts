import {DeviceConsistencySignature} from "../devices/deviceconsistencysignature";
import {ISerializableObject} from "../../../../core/object";
import {DeviceConsistencyCommitment} from "../devices/deviceconsistencycommitment";
import {IdentityKey, IdentityKeyPair} from "../keypair";
import {DeviceConsistencyCodeMessage} from "../model/whispertext";
import {Crypto} from "../crypto";


export class DeviceConsistencyMessage implements ISerializableObject {

    static FromKeyPair(commitment: DeviceConsistencyCommitment, identityKeyPair: IdentityKeyPair): DeviceConsistencyMessage {
        let sign = Crypto.Sign(commitment.serialize(), identityKeyPair.priv);

        let r = new DeviceConsistencyMessage();
        r._generation = commitment.generation;
        r._signature = new DeviceConsistencySignature(sign);

        let t = new DeviceConsistencyCodeMessage();
        t.generation = r._generation;
        t.signature = sign;
        r._serialized = t.serialout();

        return r;
    }

    static Unserialize(commitment: DeviceConsistencyCommitment, serialized: Buffer, identityKey: IdentityKey): DeviceConsistencyMessage {
        let t = new DeviceConsistencyCodeMessage();
        t.serialin(serialized);

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