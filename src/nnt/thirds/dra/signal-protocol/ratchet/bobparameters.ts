import {IdentityKey, IdentityKeyPair, KeyPair, PublicKey} from "../keypair";

export class BobParameters {

    ourIdentityKey: IdentityKeyPair;
    ourSignedPreKey: KeyPair;
    ourOneTimePreKey: KeyPair;
    ourRatchetKey: KeyPair;

    theirIdentityKey: IdentityKey;
    theirBaseKey: PublicKey;
}
