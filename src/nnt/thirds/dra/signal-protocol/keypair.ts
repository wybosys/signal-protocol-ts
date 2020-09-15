import {FixedBuffer32, FixedBuffer64, FixedBufferType} from "../../../core/buffer";
import {ISerializableObject} from "../../../core/object";
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

export class PublicKey implements ISerializableObject {
    ed: Ed25519PublicKey;
    x: X25519Key;

    get hash(): number {
        return this.ed.hash;
    }

    serialize(): Buffer {
        return this.ed.buffer;
    }

    unserialize(buf: Buffer): this {
        if (this.ed)
            this.ed.reset(buf);
        else
            this.ed = new Ed25519PublicKey(buf);
        this.x = this.ed.toX();
        return this;
    }
}

export class PrivateKey implements ISerializableObject {
    ed: Ed25519PrivateKey;
    x: X25519Key;

    get hash(): number {
        return this.ed.hash;
    }

    serialize(): Buffer {
        return this.ed.buffer;
    }

    unserialize(buf: Buffer): this {
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
    id: number;
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

    unserialize(buf: Buffer): this {
        if (!this.key)
            this.key = new PublicKey();
        this.key.unserialize(buf);
        return this;
    }

    static Sort(l: IdentityKey, r: IdentityKey) {
        return l.hash - r.hash;
    }
}

export class IdentityKeyPair extends KeyPair {

}