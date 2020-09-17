import {IdentityKeyPair, KeyPair, PrivateKey, PublicKey} from "./model/keypair";
import {FixedBuffer1, FixedBuffer16, FixedBuffer32, FixedBuffer64, FixedBuffer8} from "../../../core/buffer";
import {Random} from "../../../core/random";
import {MAX_INT} from "../../../core/kernel";
import {PreKeyRecord} from "./state/prekeyrecord";
import {SignedPreKeyRecord} from "./state/signedprekeyrecord";
import nacl = require("tweetnacl");

export type AesKeyBuffer = FixedBuffer32;
export type SignatureBuffer = FixedBuffer32;
export type IvBuffer = FixedBuffer16;
export type HMacKeyBuffer = FixedBuffer32;
export type HMacDigestBuffer = FixedBuffer8;
export type SharedKeyBuffer = FixedBuffer32;
export type SaltBuffer = FixedBuffer32;
export type SeedBuffer = FixedBuffer1;

export class Crypto {

    static GenerateKeyPair(): KeyPair {
        let r = new KeyPair();
        let kp = nacl.sign.keyPair();
        r.pub = new PublicKey(new FixedBuffer32(kp.publicKey));
        r.priv = new PrivateKey(new FixedBuffer64(kp.secretKey));
        return r;
    }

    static GenerateRegistrationId(extendedRange?: boolean): number {
        if (extendedRange) {
            return Random.Rangei(0, MAX_INT) + 1;
        }
        return Random.Rangei(0, 16380) + 1;
    }

    static GetRandomSequence(max: number) {
        return Random.Rangei(0, max);
    }

    static GeneratePreKeys(start: number, count: number): PreKeyRecord[] {
        let r: PreKeyRecord[] = [];

        for (let i = 0; i < count; ++i) {
            let rcd = PreKeyRecord.Create(
                start + i,
                this.GenerateKeyPair());
            r.push(rcd);
        }

        return r;
    }

    static GenerateSignedPreKey(identityKeyPair: IdentityKeyPair, signedPreKeyId: number): SignedPreKeyRecord {
        let keyPair = this.GenerateKeyPair();
        let signature = this.Sign(identityKeyPair.priv.forSerialize.buffer, keyPair.priv);
        let now = new Date().getTime();
        return SignedPreKeyRecord.Create(signedPreKeyId, now, keyPair, signature);
    }

    static GenerateSenderSigningKey(): KeyPair {
        return this.GenerateKeyPair();
    }

    static GenerateSenderKey(): FixedBuffer32 {
        let r = nacl.randomBytes(32);
        return new FixedBuffer32(r);
    }

    static GenerateSenderKeyId(): number {
        return Random.Rangei(0, MAX_INT);
    }

    static Sign(buf: Buffer, key: PrivateKey): SignatureBuffer {
        let res = nacl.sign.detached(buf, key.forSign.buffer);
        return new FixedBuffer32(res);
    }

    static VerifySign(buf: Buffer, sig: SignatureBuffer, key: PublicKey): boolean {
        return nacl.sign.detached.verify(buf, sig.buffer, key.forSign.buffer);
    }

    static SharedKey(their: PublicKey, out: PrivateKey): SharedKeyBuffer {
        let res = nacl.box.before(their.forCrypto.buffer, out.forCrypto.buffer);
        return new FixedBuffer32(res);
    }

}