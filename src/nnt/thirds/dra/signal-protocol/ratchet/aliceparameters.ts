import {KeyPair} from "../model/keypair";
import {IdentityKeyPair} from "../model/identitykeypair";
import {PublicKey} from "../model/publickey";

export class AliceParameters {

    ourIdentityKey: IdentityKeyPair;
    ourBaseKey: KeyPair;

    theirIdentityKey: IdentityKeyPair;
    theirSignedPreKey: PublicKey;
    theirOneTimePreKey: PublicKey;
    theirRatchetKey: PublicKey;
}