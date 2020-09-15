export class Signature {

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
}