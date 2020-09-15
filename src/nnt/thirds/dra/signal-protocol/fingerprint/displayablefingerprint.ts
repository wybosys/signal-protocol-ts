import {DeviceConsistencyCodeGenerator} from "../devices/deviceconsistencycodegenerator";

export class DisplayableFingerprint {

    constructor(local: Buffer, remote: Buffer) {
        this._local = DisplayableFingerprint.GetDisplayStringFor(local);
        this._remote = DisplayableFingerprint.GetDisplayStringFor(remote);
        this._string = this._local <= this._remote ? `${this._local}${this._remote}` : `${this._remote}${this._local}`;
    }

    private _local: string;
    private _remote: string;
    private _string: string;

    toString() {
        return this._string;
    }

    static GetDisplayStringFor(fp: Buffer) {
        return [
            DeviceConsistencyCodeGenerator.GetEncodedChunk(fp, 0),
            DeviceConsistencyCodeGenerator.GetEncodedChunk(fp, 5),
            DeviceConsistencyCodeGenerator.GetEncodedChunk(fp, 10),
            DeviceConsistencyCodeGenerator.GetEncodedChunk(fp, 15),
            DeviceConsistencyCodeGenerator.GetEncodedChunk(fp, 20),
            DeviceConsistencyCodeGenerator.GetEncodedChunk(fp, 25)
        ].join('');
    }
}