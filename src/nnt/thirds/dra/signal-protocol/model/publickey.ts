import {FixedBuffer32, FixedBufferType} from "../../../../core/buffer";
import {IComparableObject, IEqualableObject, IHashObject, ISerializableObject} from "../../../../core/object";
import ed2curve = require("ed2curve");

class X25519PublicKey extends FixedBuffer32 {

    constructor(buf?: FixedBufferType) {
        super(buf);
    }

    _x25519: any;
}

class Ed25519PublicKey extends FixedBuffer32 {

    constructor(buf?: FixedBufferType) {
        super(buf);
    }

    toX(): X25519PublicKey {
        return new X25519PublicKey(ed2curve.convertPublicKey(this.buffer));
    }

    _ed25519: any;
}

export class PublicKey implements ISerializableObject, IComparableObject, IEqualableObject, IHashObject {

    constructor(buf?: FixedBuffer32) {
        if (buf) {
            this.ed = new Ed25519PublicKey(buf.buffer);
            this.x = this.ed.toX();
        }
    }

    static FromBuffer(buf: Buffer): PublicKey {
        return new PublicKey(new FixedBuffer32(buf));
    }

    protected ed: Ed25519PublicKey;
    protected x: X25519PublicKey;

    get forSerialize(): FixedBuffer32 {
        return this.ed;
    }

    get forSign(): FixedBuffer32 {
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
            this.ed.reset(buf);
        else
            this.ed = new Ed25519PublicKey(buf);
        this.x = this.ed.toX();
        return this;
    }

    compare(r: this): number {
        return this.ed.compare(r.ed);
    }

    isEqual(r: this): boolean {
        return this.compare(r) == 0;
    }

    static Sort(l: PublicKey, r: PublicKey): number {
        return l.hash - r.hash;
    }
}

