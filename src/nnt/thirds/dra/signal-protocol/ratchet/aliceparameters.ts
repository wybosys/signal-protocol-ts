import {IdentityKey, IdentityKeyPair, KeyPair, PublicKey} from "../keypair";

export class AliceParameters {

    ourIdentityKey: IdentityKeyPair;
    ourBaseKey: KeyPair;

    theirIdentityKey: IdentityKey;
    theirSignedPreKey: PublicKey;
    theirOneTimePreKey: PublicKey;
    theirRatchetKey: PublicKey;
}