import {CombinedFingerprintsModel, LogicalFingerprintModel} from "../model/fingerprint";
import {use} from "../../../../core/kernel";
import {IEqualableObject, ISerializableObject} from "../../../../core/object";

export class ScannableFingerprint implements ISerializableObject, IEqualableObject {

    private _version: number;
    private _fingerprints: CombinedFingerprintsModel;

    constructor(version: number, localFingerprintData: Buffer, remoteFIngerprintData: Buffer) {
        let local = use(new LogicalFingerprintModel(), m => {
            m.content = localFingerprintData.subarray(0, 32);
        });
        let remote = use(new LogicalFingerprintModel(), m => {
            m.content = remoteFIngerprintData.subarray(0, 32);
        });
        this._version = version;
        this._fingerprints = use(new CombinedFingerprintsModel(), m => {
            m.version = version;
            m.local = local;
            m.remote = remote;
        });
    }

    serialize(): Buffer {
        return this._fingerprints.serialize();
    }

    deserialize(buf: Buffer): this {
        this._fingerprints = new CombinedFingerprintsModel().deserialize(buf);
        this._version = this._fingerprints.version;
        return this;
    }

    isEqual(r: this): boolean {
        return this._fingerprints.isEqual(r._fingerprints);
    }
}