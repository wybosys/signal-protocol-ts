import {IdentityKey} from "../model/identitykey";
import {Fingerprint} from "./fingerprint";

export interface FingerprintGenerator {

    createFor(version: number,
              localStableIdentifier: Buffer, localIdentityKey: IdentityKey,
              remoteStableIdentifier: Buffer, remoteIdentityKey: IdentityKey): Fingerprint;

    createFors(version: number,
               localStableIdentifier: Buffer, localIdentityKeys: IdentityKey[],
               remoteStableIdentifier: Buffer, remoteIdentityKeys: IdentityKey[]): Fingerprint;

}