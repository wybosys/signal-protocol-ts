import {KeyPair} from "../model/keypair";
import {IdentityKeyPair} from "../model/identitykeypair";
import {PublicKey} from "../model/publickey";

export class BobParameters {

    ourIdentityKey: IdentityKeyPair;
    ourSignedPreKey: KeyPair;
    ourOneTimePreKey: KeyPair;
    ourRatchetKey: KeyPair;

    theirIdentityKey: IdentityKeyPair;
    theirBaseKey: PublicKey;
}
