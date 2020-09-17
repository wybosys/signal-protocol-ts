import {IdentityKeyPair, KeyPair, PublicKey} from "../model/keypair";

export class BobParameters {

    ourIdentityKey: IdentityKeyPair;
    ourSignedPreKey: KeyPair;
    ourOneTimePreKey: KeyPair;
    ourRatchetKey: KeyPair;

    theirIdentityKey: IdentityKeyPair;
    theirBaseKey: PublicKey;
}
