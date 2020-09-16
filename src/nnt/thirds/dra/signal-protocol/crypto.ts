import {PrivateKey, PublicKey} from "./keypair";
import {FixedBuffer16, FixedBuffer32, FixedBuffer8} from "../../../core/buffer";
import nacl = require("tweetnacl");

export type AesKeyBuffer = FixedBuffer32;
export type SignatureBuffer = FixedBuffer32;
export type IvBuffer = FixedBuffer16;
export type HMacKeyBuffer = FixedBuffer32;
export type HMacDigestBuffer = FixedBuffer8;
export type SharedKeyBuffer = FixedBuffer32;
export type SaltBuffer = FixedBuffer32;

export class Crypto {

    static Sign(buf: Buffer, key: PrivateKey): SignatureBuffer {
        let res = nacl.sign.detached(buf, key.ed.buffer);
        return new FixedBuffer32(res);
    }

    static VerifySign(buf: Buffer, sig: SignatureBuffer, key: PublicKey): boolean {
        return nacl.sign.detached.verify(buf, sig.buffer, key.ed.buffer);
    }

    static SharedKey(their: PublicKey, out: PrivateKey): SharedKeyBuffer {
        let res = nacl.box.before(their.x.buffer, out.x.buffer);
        return new FixedBuffer32(res);
    }

}