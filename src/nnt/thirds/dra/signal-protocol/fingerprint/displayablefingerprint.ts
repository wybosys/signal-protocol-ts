import {CodeGenerator} from "../devices/codegenerator";

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
            CodeGenerator.GetEncodedChunk(fp, 0),
            CodeGenerator.GetEncodedChunk(fp, 5),
            CodeGenerator.GetEncodedChunk(fp, 10),
            CodeGenerator.GetEncodedChunk(fp, 15),
            CodeGenerator.GetEncodedChunk(fp, 20),
            CodeGenerator.GetEncodedChunk(fp, 25)
        ].join('');
    }
}