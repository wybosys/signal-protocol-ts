import {FixedBuffer32, FixedBuffer64, FixedBufferType} from "../../../core/buffer";
import {IComparableObject, ISerializableObject} from "../../../core/object";
import ed2curve = require("ed2curve");

class Ed25519PublicKey extends FixedBuffer32 {

    constructor(buf?: FixedBufferType) {
        super(buf);
    }

    toX(): X25519Key {
        return new X25519Key(ed2curve.convertPublicKey(this.buffer));
    }

    _ed25519: any;
}

class Ed25519PrivateKey extends FixedBuffer64 {

    constructor(buf?: FixedBufferType) {
        super(buf);
    }

    toX(): X25519Key {
        return new X25519Key(ed2curve.convertSecretKey(this.buffer));
    }

    _ed25519: any;
}

class X25519Key extends FixedBuffer32 {

    constructor(buf?: FixedBufferType) {
        super(buf);
    }

    _x25519: any;
}

export class PublicKey implements ISerializableObject, IComparableObject {

    constructor(buf?: FixedBuffer32) {
        if (buf) {
            this.ed = new Ed25519PublicKey(buf.buffer);
            this.x = this.ed.toX();
        }
    }

    protected ed: Ed25519PublicKey;
    protected x: X25519Key;

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
        return this.ed.buffer;
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
}

export class PrivateKey implements ISerializableObject {

    constructor(buf?: FixedBuffer64) {
        if (buf) {
            this.ed = new Ed25519PrivateKey(buf.buffer);
            this.x = this.ed.toX();
        }
    }

    protected ed: Ed25519PrivateKey;
    protected x: X25519Key;

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
        return this.ed.buffer;
    }

    deserialize(buf: Buffer): this {
        if (this.ed)
            this.ed = new Ed25519PrivateKey(buf);
        else
            this.ed.reset(buf);
        this.x = this.ed.toX();
        return this;
    }
}

export class KeyPair {
    pub: PublicKey;
    priv: PrivateKey;
}

export class PreKey {
    index: number;
    key: PublicKey;
}

export class SignedPreKey extends PreKey {
    signature: FixedBuffer32;
}

export class IdentityKey implements ISerializableObject {
    key: PublicKey;

    get hash(): number {
        return this.key.hash;
    }

    serialize(): Buffer {
        return this.key.serialize();
    }

    deserialize(buf: Buffer): this {
        if (!this.key)
            this.key = new PublicKey();
        this.key.deserialize(buf);
        return this;
    }

    static Sort(l: IdentityKey, r: IdentityKey) {
        return l.hash - r.hash;
    }
}

export class IdentityKeyPair extends KeyPair {

}