import {IdentityKeyPair, KeyPair, PublicKey} from "../keypair";

export class AliceParameters {

    ourIdentityKey: IdentityKeyPair;
    ourBaseKey: KeyPair;

    theirIdentityKey: IdentityKeyPair;
    theirSignedPreKey: PublicKey;
    theirOneTimePreKey: PublicKey;
    theirRatchetKey: PublicKey;
}