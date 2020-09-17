import {AesKeyBuffer, HMacKeyBuffer, IvBuffer} from "../crypto";
import {BufferT} from "../../../../core/buffert";
import {FixedBuffer16, FixedBuffer32} from "../../../../core/buffer";

const CIPHER_KEY_LENGTH = 32;
const MAC_KEY_LENGTH = 32;
const IV_LENGTH = 16;

export class DerivedMessageSecrets {

    static SIZE = 80;

    private _cipherKey: AesKeyBuffer;
    private _macKey: HMacKeyBuffer;
    private _iv: IvBuffer;

    constructor(okm: Buffer) {
        let keys = BufferT.SplitAs(okm, CIPHER_KEY_LENGTH, MAC_KEY_LENGTH, IV_LENGTH);
        this._cipherKey = new FixedBuffer32(keys[0]);
        this._macKey = new FixedBuffer32(keys[1]);
        this._iv = new FixedBuffer16(keys[2]);
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
}