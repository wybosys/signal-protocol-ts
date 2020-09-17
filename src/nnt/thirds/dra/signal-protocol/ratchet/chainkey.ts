import {BufferT} from "../../../../core/buffert";
import {HKDF} from "../kdf/HKDF";
import {MessageKeys} from "./messagekeys";
import {DerivedMessageSecrets} from "../kdf/derivedmessagesecrets";
import {PublicKey} from "../model/keypair";
import crypto = require('crypto');

const MESSAGE_KEY_SEED = BufferT.FromInt8(0x01);
const CHAIN_KEY_SEED = BufferT.FromInt8(0x02);

export class ChainKey {

    private _kdf: HKDF;
    private _key: PublicKey;
    private _index: number;

    constructor(kdf: HKDF, key: PublicKey, index: number) {
        this._kdf = kdf;
        this._key = key;
        this._index = index;
    }

    getNextChainKey(): ChainKey {
        let nextKey = this.getBaseMaterial(CHAIN_KEY_SEED);
        return new ChainKey(this._kdf, PublicKey.FromBuffer(nextKey), this._index + 1);
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

    private getBaseMaterial(seed: Buffer): Buffer {
        let cry = crypto.createHmac('sha256', this._key.forSerialize.buffer);
        cry.update(seed);
        return cry.digest();
    }
}