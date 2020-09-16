import {HMacKeyBuffer, IvBuffer} from "../crypto";
import {BufferT} from "../../../../core/buffert";
import {FixedBuffer16, FixedBuffer32} from "../../../../core/buffer";
import {KeyPair, PublicKey} from "../keypair";
import {use} from "../../../../core/kernel";

const CIPHER_KEY_LENGTH = 32;
const MAC_KEY_LENGTH = 32;
const IV_LENGTH = 16;

export class DerivedMessageSecrets {

    static SIZE = 80;

    private _cipherKey: KeyPair;
    private _macKey: HMacKeyBuffer;
    private _iv: IvBuffer;

    constructor(okm: Buffer) {
        let keys = BufferT.SplitAs(okm, CIPHER_KEY_LENGTH, MAC_KEY_LENGTH, IV_LENGTH);
        this._cipherKey = use(new KeyPair(), kp => {
            kp.pub = new PublicKey(new FixedBuffer32(keys[0]));
        });
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