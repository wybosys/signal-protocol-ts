import {FixedBuffer32, FixedBuffer64, FixedBufferType} from "../../../../core/buffer";
import {IHashObject, ISerializableObject} from "../../../../core/object";
import ed2curve = require("ed2curve");

class X25519SecretKey extends FixedBuffer32 {

    constructor(buf?: FixedBufferType) {
        super(buf);
    }

    _x25519: any;
}


class Ed25519PrivateKey extends FixedBuffer64 {

    constructor(buf?: FixedBufferType) {
        super(buf);
    }

    toX(): X25519SecretKey {
        return new X25519SecretKey(ed2curve.convertSecretKey(this.buffer));
    }

    _ed25519: any;
}

export class PrivateKey implements ISerializableObject, IHashObject {

    constructor(buf?: FixedBuffer64) {
        if (buf) {
            this.ed = new Ed25519PrivateKey(buf.buffer);
            this.x = this.ed.toX();
        }
    }

    static FromBuffer(buf: Buffer): PrivateKey {
        return new PrivateKey(new FixedBuffer64(buf));
    }

    protected ed: Ed25519PrivateKey;
    protected x: X25519SecretKey;

    get forSerialize(): FixedBuffer64 {
        return this.ed;
    }

    get forSign(): FixedBuffer64 {
        return this.ed;
    }

    get forCrypto(): FixedBuffer32 {
        return this.x;
    }

    get hash(): number {
        return this.ed.hash;
    }

    serialize(): Buffer {
        return this.forSerialize.buffer;
    }

    deserialize(buf: Buffer): this {
        if (this.ed)
            this.ed = new Ed25519PrivateKey(buf);
        else
            this.ed.reset(buf);
        this.x = this.ed.toX();
        return this;
    }

    static Sort(l: PrivateKey, r: PrivateKey) {
        return l.hash - r.hash;
    }
}

