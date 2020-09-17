import {IdentityKey} from "../model/keypair";
import * as crypto from 'crypto';
import {BufferT} from "../../../../core/buffert";
import {ISerializableObject} from "../../../../core/object";

export class DeviceConsistencyCommitment implements ISerializableObject {

    constructor(generation: number, identityKeys: IdentityKey[]) {
        let keys = identityKeys.concat();
        keys.sort(IdentityKey.Sort);

        let cry = crypto.createHash('sha-512');
        cry.update(DeviceConsistencyCommitment.VERSION);
        cry.update(BufferT.FromInt32BE(generation));
        identityKeys.forEach(e => {
            cry.update(e.serialize());
        });

        this._generation = generation;
        this._serialized = cry.digest();
    }

    static VERSION = "::nnt::dra::device::commitment::v0";

    private _generation: number;
    private _serialized: Buffer;

    get generation(): number {
        return this._generation;
    }

    serialize(): Buffer {
        return this._serialized;
    }

    deserialize(buf: Buffer): this {
        return null;
    }
}