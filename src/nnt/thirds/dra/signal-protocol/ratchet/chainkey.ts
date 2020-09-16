import {BufferT} from "../../../../core/buffert";
import {HKDF} from "../kdf/HKDF";
import {FixedBuffer8} from "../../../../core/buffer";
import {MessageKeys} from "./messagekeys";
import {DerivedMessageSecrets} from "../kdf/derivedmessagesecrets";
import crypto = require('crypto');

const MESSAGE_KEY_SEED = new FixedBuffer8(BufferT.FromInt8(0x01));
const CHAIN_KEY_SEED = new FixedBuffer8(BufferT.FromInt8(0x02));

export class ChainKey {

    private _kdf: HKDF;
    private _key: Buffer;
    private _index: number;

    constructor(kdf: HKDF, key: Buffer, index: number) {
        this._kdf = kdf;
        this._key = key;
        this._index = index;
    }

    getNextChainKey(): ChainKey {
        let nextKey = this.getBaseMaterial(CHAIN_KEY_SEED);
        return new ChainKey(this._kdf, nextKey, this._index + 1);
    }

    getMessageKeys(): MessageKeys {
        let inputKeyMaterial = this.getBaseMaterial(MESSAGE_KEY_SEED);
        let keyMaterialBytes = this._kdf.deriveSecrets(inputKeyMaterial, Buffer.from('WhisperMessageKeys'), DerivedMessageSecrets.SIZE);

        let keyMaterial = new DerivedMessageSecrets(keyMaterialBytes);
        return new MessageKeys(keyMaterial.cipherKey, keyMaterial.macKey, keyMaterial.iv, this._index);
    }

    get key() {
        return this._key;
    }

    get index() {
        return this._index;
    }

    private getBaseMaterial(seed: FixedBuffer8): Buffer {
        let cry = crypto.createHmac('sha256', this._key);
        cry.update(seed.buffer);
        return cry.digest();
    }
}