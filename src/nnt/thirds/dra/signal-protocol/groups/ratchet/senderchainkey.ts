import {BufferT} from "../../../../../core/buffert";
import {SenderMessageKey} from "./sendermessagekey";

const crypto = require('crypto');

const MESSAGE_KEY_SEED = BufferT.FromInt8(0x01);
const CHAIN_KEY_SEED = BufferT.FromInt8(0x02);

export class SenderChainKey {

    private _iteration: number;
    private _seed: Buffer;

    constructor(iteration: number, seed: Buffer) {
        this._iteration = iteration;
        this._seed = seed;
    }

    get iteration() {
        return this._iteration;
    }

    getSenderMessageKey() {
        return new SenderMessageKey(
            this._iteration,
            this.getDerivative(MESSAGE_KEY_SEED));
    }

    getNext() {
        return new SenderChainKey(
            this._iteration + 1,
            this.getDerivative(CHAIN_KEY_SEED));
    }

    get seed() {
        return this._seed;
    }

    private getDerivative(seed: Buffer): Buffer {
        let cry = crypto.createHmac('sha256', this._seed);
        cry.update(seed);
        return cry.digest();
    }
}