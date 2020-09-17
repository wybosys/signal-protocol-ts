import {IvBuffer} from "../../crypto";
import {KeyPair, PublicKey} from "../../keypair";
import {HKDFv3} from "../../kdf/HKDFv3";
import {BufferT} from "../../../../../core/buffert";
import {FixedBuffer16} from "../../../../../core/buffer";

export class SenderMessageKey {

    private _iteration: number;
    private _iv: IvBuffer;
    private _cipherKey: KeyPair;
    private _seed: Buffer;

    constructor(iteration: number, seed: Buffer) {
        let derivate = new HKDFv3().deriveSecrets(seed, Buffer.from('WhisperGroup'), 48);
        let parts = BufferT.SplitAs(derivate, 16, 32);

        this._iteration = iteration;
        this._seed = seed;
        this._iv = new FixedBuffer16(parts[0]);

        let kp = new KeyPair();
        kp.pub = PublicKey.FromBuffer(parts[1]);
        this._cipherKey = kp;
    }

    get iteration() {
        return this._iteration;
    }

    get iv() {
        return this._iv;
    }

    get cipherKey() {
        return this._cipherKey;
    }

    get seed() {
        return this._seed;
    }
}