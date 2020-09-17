import {FingerprintGenerator} from "./generator";
import {IdentityKey} from "../model/identitykey";
import {Fingerprint} from "./fingerprint";
import {BytesBuilder} from "../../../../core/bytes";
import {BufferT} from "../../../../core/buffert";
import {DisplayableFingerprint} from "./displayablefingerprint";
import {ScannableFingerprint} from "./scannablefingerprint";
import crypto = require('crypto');

export class NumericFingerprintGenerator implements FingerprintGenerator {

    static FINGERPRINT_VERSION = 0;

    private _iterations: number;

    constructor(iterations: number) {
        this._iterations = iterations;
    }

    createFor(version: number,
              localStableIdentifier: Buffer, localIdentityKey: IdentityKey,
              remoteStableIdentifier: Buffer, remoteIdentityKey: IdentityKey): Fingerprint {
        return this.createFors(version,
            localStableIdentifier, [localIdentityKey],
            remoteStableIdentifier, [remoteIdentityKey]);
    }

    createFors(version: number,
               localStableIdentifier: Buffer, localIdentityKeys: IdentityKey[],
               remoteStableIdentifier: Buffer, remoteIdentityKeys: IdentityKey[]): Fingerprint {
        let localFingerprint = NumericFingerprintGenerator.GetFingerprint(this._iterations, localStableIdentifier, localIdentityKeys)
        let remoteFingerprint = NumericFingerprintGenerator.GetFingerprint(this._iterations, remoteStableIdentifier, remoteIdentityKeys);

        let displayable = new DisplayableFingerprint(localFingerprint, remoteFingerprint);
        let scannable = new ScannableFingerprint(version, localFingerprint, remoteFingerprint);

        return new Fingerprint(displayable, scannable);
    }

    private static GetFingerprint(iterations: number, stableIdentifier: Buffer, unsortedIdentityKeys: IdentityKey[]): Buffer {
        let publicKey = this.GetLogicalKeyBytes(unsortedIdentityKeys);
        let hash = Buffer.concat([
            BufferT.FromInt16BE(this.FINGERPRINT_VERSION),
            publicKey,
            stableIdentifier
        ]);

        let cry = crypto.createHash('sha512');
        for (let i = 0; i < iterations; ++i) {
            cry.update(hash);
            cry.update(publicKey);
            hash = cry.digest();
        }

        return hash;
    }

    private static GetLogicalKeyBytes(identityKeys: IdentityKey[]): Buffer {
        let sortedKeys = identityKeys.concat().sort(IdentityKey.Sort);
        let bytes = new BytesBuilder();
        sortedKeys.forEach(e => {
            let buf = e.serialize();
            bytes.addBuffer(buf);
        });
        return bytes.trim().buffer;
    }

}