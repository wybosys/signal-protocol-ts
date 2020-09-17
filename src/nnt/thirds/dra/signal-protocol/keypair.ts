import {FixedBuffer32, FixedBuffer64, FixedBufferType} from "../../../core/buffer";
import {IComparableObject, IEqualableObject, IHashObject, IPodObject, ISerializableObject} from "../../../core/object";
import {IndexedObject} from "../../../core/kernel";
import {toJson, toJsonObject} from "../../../core/json";
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

export class KeyPair implements IPodObject {

    pub: PublicKey;
    priv: PrivateKey;

    toPod(): IndexedObject {
        return {
            pub: this.pub?.serialize(),
            priv: this.priv?.serialize()
        };
    }

    fromPod(obj: IndexedObject): this {
        if (obj.pub)
            this.pub = new PublicKey().deserialize(obj.pub);
        if (obj.priv)
            this.priv = new PrivateKey().deserialize(obj.priv);
        return this;
    }
}

export class PreKey extends PublicKey implements IPodObject {

    index: number;

    toPod(): IndexedObject {
        return {
            index: this.index,
            key: super.serialize()
        };
    }

    fromPod(obj: IndexedObject): this {
        this.index = obj.index;
        super.deserialize(obj.key);
        return this;
    }

    serialize(): Buffer {
        return Buffer.from(toJson(this.toPod()));
    }

    deserialize(buf: Buffer): this {
        return this.fromPod(toJsonObject(buf.toString()));
    }
}

export class SignedPreKey extends PreKey {
    signature: FixedBuffer32;

    toPod(): IndexedObject {
        return {
            ...super.toPod(),
            signature: this.signature?.serialize()
        };
    }

    fromPod(obj: IndexedObject): this {
        if (obj.signature)
            this.signature = new FixedBuffer32(obj.signature);
        return super.fromPod(obj);
    }
}

export class IdentityKey extends PublicKey {

}

export class IdentityKeyPair extends KeyPair {

}