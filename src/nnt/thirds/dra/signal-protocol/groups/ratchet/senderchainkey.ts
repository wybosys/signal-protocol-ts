import {BufferT} from "../../../../../core/buffert";
import {SenderMessageKey} from "./sendermessagekey";

const crypto = require('crypto');

const MESSAGE_KEY_SEED = BufferT.FromInt8(0x01);
const CHAIN_KEY_SEED = BufferT.FromInt8(0x02);

export class SenderChainKey {

    private _iteration: number;
    private _chainKey: Buffer;

    constructor(iteration: number, chainKey: Buffer) {
        this._iteration = iteration;
        this._chainKey = chainKey;
    }

    get iteration() {
        return this._iteration;
    }

    getSenderMessageKey() {
        return new SenderMessageKey(this._iteration, this.getDerivative(MESSAGE_KEY_SEED, this._chainKey));
    }

    getNext() {
        return new SenderChainKey(this._iteration + 1, this.getDerivative(CHAIN_KEY_SEED, this._chainKey));
    }

    get seed() {
        return this._chainKey;
    }

    private getDerivative(seed: Buffer, key: Buffer): Buffer {
        let cry = crypto.createHmac('sha256', key);
        cry.update(seed);
        return cry.digest();
    }
}