export class DeviceConsistencySignature {

    constructor(sign: Buffer, vrfop: Buffer) {
        this._sign = sign;
        this._vrfoutput = vrfop;
    }

    get vrfouput(): Buffer {
        return this._vrfoutput;
    }

    get signature(): Buffer {
        return this._sign;
    }

    private _vrfoutput: Buffer;
    private _sign: Buffer;

    static Sort(l: DeviceConsistencySignature, r: DeviceConsistencySignature) {
        return l._vrfoutput.compare(r._vrfoutput);
    }
}