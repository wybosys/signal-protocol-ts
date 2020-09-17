import {IdentityKey, PublicKey} from "../model/keypair";
import {SignatureBuffer} from "../crypto";

export class PreKeyBundle {

    private _registrationId: number;
    private _deviceId: number;
    private _preKeyId: number;
    private _preKeyPublic: PublicKey;
    private _signedPreKeyId: number;
    private _signedPreKeyPublic: PublicKey;
    private _signedPreKeySignature: SignatureBuffer;
    private _identityKey: IdentityKey;

    constructor(registrationId: number, deviceId: number, preKeyId: number, preKeyPublic: PublicKey, signedPreKeyId: number, signedPreKeyPublic: PublicKey, signedPreKeySignature: SignatureBuffer, identityKey: IdentityKey) {
        this._registrationId = registrationId;
        this._deviceId = deviceId;
        this._preKeyId = preKeyId;
        this._signedPreKeyId = signedPreKeyId;
        this._signedPreKeyPublic = signedPreKeyPublic;
        this._signedPreKeySignature = signedPreKeySignature;
        this._identityKey = identityKey;
    }

    get deviceId() {
        return this._deviceId;
    }

    get preKeyId() {
        return this._preKeyId;
    }

    get preKey() {
        return this._preKeyPublic;
    }

    get signedPreKeyId() {
        return this._signedPreKeyId;
    }

    get signedPreKey() {
        return this._signedPreKeyPublic;
    }

    get signedPreKeySignature() {
        return this._signedPreKeySignature;
    }

    get identityKey() {
        return this._identityKey;
    }

    get registrationId() {
        return this._registrationId;
    }
}