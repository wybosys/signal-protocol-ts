import {SignatureBuffer} from "../crypto";

export class DeviceConsistencySignature {

    constructor(sign: SignatureBuffer/*, vrfop: Buffer*/) {
        this._sign = sign;
        //this._vrfoutput = vrfop;
    }

    /*
    get vrfouput(): Buffer {
        return this._vrfoutput;
    }
     */

    get signature() {
        return this._sign;
    }

    // private _vrfoutput: Buffer; 暂未找到vrf的合适实现
    private _sign: SignatureBuffer;

    static Sort(l: DeviceConsistencySignature, r: DeviceConsistencySignature) {
        //return l._vrfoutput.compare(r._vrfoutput);
        return l._sign.compare(r._sign);
    }
}