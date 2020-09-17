import {HMacKeyBuffer, IvBuffer} from "../crypto";
import {KeyPair} from "../model/keypair";

export class MessageKeys {

    private _cipherKey: KeyPair;
    private _macKey: HMacKeyBuffer;
    private _iv: IvBuffer;
    private _counter: number;

    constructor(cipherKey: KeyPair, macKey: HMacKeyBuffer, iv: IvBuffer, counter: number) {
        this._cipherKey = cipherKey;
        this._macKey = macKey;
        this._iv = iv;
        this._counter = counter;
    }

    get cipherKey() {
        return this._cipherKey;
    }

    get macKey() {
        return this._macKey;
    }

    get iv() {
        return this._iv;
    }

    get counter() {
        return this._counter;
    }
}