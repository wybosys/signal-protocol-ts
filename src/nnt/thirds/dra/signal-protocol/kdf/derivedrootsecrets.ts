import {FixedBuffer32} from "../../../../core/buffer";
import {BufferT} from "../../../../core/buffert";

const SIZE = 64;

export class DerivedRootSecrets {

    private _rootKey: FixedBuffer32;
    private _chainKey: FixedBuffer32;

    constructor(okm: Buffer) {
        let keys = BufferT.SplitAs(okm, 32, 32);
        this._rootKey = new FixedBuffer32(keys[0]);
        this._chainKey = new FixedBuffer32(keys[1]);
    }

    get rootKey() {
        return this._rootKey;
    }

    get chainKey() {
        return this._chainKey;
    }
}