import {IdentityKeyPair, KeyPair, PublicKey} from "../model/keypair";

export class SymmetricParameters {

    private _ourBaseKey: KeyPair;
    private _ourRatchetKey: KeyPair;
    private _ourIdentityKey: IdentityKeyPair;

    private _theirBaseKey: PublicKey;
    private _theirRatchetKey: PublicKey;
    private _theirIdentityKey: IdentityKeyPair;

    constructor(ourBaseKey: KeyPair, ourRatchetKey: KeyPair, ourIdentityKey: IdentityKeyPair, theirBaseKey: PublicKey, theirRatchetKey: PublicKey, theirIdentityKey: IdentityKeyPair) {
        this._ourBaseKey = ourBaseKey;
        this._ourRatchetKey = ourRatchetKey;
        this._ourIdentityKey = ourIdentityKey;
        this._theirBaseKey = theirBaseKey;
        this._theirRatchetKey = theirRatchetKey;
        this._theirIdentityKey = theirIdentityKey;
    }

    get ourBaseKey() {
        return this._ourBaseKey;
    }

    get ourRatchetKey() {
        return this._ourRatchetKey;
    }

    get ourIdentityKey() {
        return this._ourIdentityKey;
    }

    get theirBaseKey() {
        return this._theirBaseKey;
    }

    get theirRatchetKey() {
        return this._theirRatchetKey;
    }

    get theirIdentityKey() {
        return this._theirIdentityKey;
    }
}