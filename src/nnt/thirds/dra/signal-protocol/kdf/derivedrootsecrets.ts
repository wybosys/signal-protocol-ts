import {BufferT} from "../../../../core/buffert";
import {PublicKey} from "../model/publickey";

export class DerivedRootSecrets {

    static SIZE = 64;

    private _rootKey: PublicKey;
    private _chainKey: PublicKey;

    constructor(okm: Buffer) {
        let keys = BufferT.SplitAs(okm, 32, 32);
        this._rootKey = PublicKey.FromBuffer(keys[0]);
        this._chainKey = PublicKey.FromBuffer(keys[1]);
    }

    get rootKey() {
        return this._rootKey;
    }

    get chainKey() {
        return this._chainKey;
    }
}