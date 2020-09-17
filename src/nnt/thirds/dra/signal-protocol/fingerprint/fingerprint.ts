import {DisplayableFingerprint} from "./displayablefingerprint";
import {ScannableFingerprint} from "./scannablefingerprint";

export class Fingerprint {

    private _displayableFingerprint: DisplayableFingerprint;
    private _scannableFingerprint: ScannableFingerprint;

    constructor(displayable: DisplayableFingerprint, scannable: ScannableFingerprint) {
        this._displayableFingerprint = displayable;
        this._scannableFingerprint = scannable;
    }

    get displayableFingerprint() {
        return this._displayableFingerprint;
    }

    get scannableFingerprint() {
        return this._scannableFingerprint;
    }
}