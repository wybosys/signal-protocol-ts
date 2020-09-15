import * as crypto from 'crypto';
import {BufferT} from "../../../../core/buffert";
import * as util from 'util';
import {DeviceConsistencyCommitment} from "./deviceconsistencycommitment";
import {DeviceConsistencySignature} from "./deviceconsistencysignature";

export class DeviceConsistencyCodeGenerator {
    static CODE_VERSION = 0;

    static GenerateFor(commitment: DeviceConsistencyCommitment, signatures: DeviceConsistencySignature[]) {
        let signs = signatures.concat();
        signs.sort(DeviceConsistencySignature.Sort);

        let cry = crypto.createHash('sha-512');
        cry.update(BufferT.FromInt32BE(this.CODE_VERSION));
        cry.update(commitment.serialize());

        signs.forEach(e => {
            cry.update(e.signature.buffer);
        });

        let hash = cry.digest();
        let digits = [
            this.GetEncodedChunk(hash, 0),
            this.GetEncodedChunk(hash, 5)
        ].join();
        return digits.substr(0, 6);
    }

    static GetEncodedChunk(hash: Buffer, offset: number) {
        let chunk = hash.subarray(offset, offset + 5).readBigInt64BE() % 100000n;
        return util.format("%05d", chunk);
    }
}