import {PrivateKey, PublicKey} from "./keypair";
import {FixedBuffer32} from "../../../core/buffer";
import nacl = require("tweetnacl");

export type SignatureBuffer = FixedBuffer32;

export class Crypto {

    static Sign(buf: Buffer, key: PrivateKey): SignatureBuffer {
        let res = nacl.sign.detached(buf, key.ed.buffer);
        return new FixedBuffer32(res);
    }

    static VerifySign(buf: Buffer, sig: SignatureBuffer, key: PublicKey): boolean {
        return nacl.sign.detached.verify(buf, sig.buffer, key.ed.buffer);
    }
}