import {HKDFv2} from "./HKDFv2";
import {HKDFv3} from "./HKDFv3";
import {FixedBuffer32} from "../../../../core/buffer";
import * as crypto from 'crypto';
import {BytesBuilder} from "../../../../core/bytes";
import {BufferT} from "../../../../core/buffert";

const HASH_OUTPUT_SIZE = 32;

export abstract class HKDF {

    static CreateFor(messageVersion: number): HKDF {
        switch (messageVersion) {
            case 2:
                return new HKDFv2();
            case 3:
                return new HKDFv3();
        }

        console.error(`dra: 不支持该版本协议 ${messageVersion}`);
        return null;
    }

    deriveSecrets(inputKeyMaterial: Buffer, info: Buffer, outputLength: number, salt?: FixedBuffer32): Buffer {
        if (!salt)
            salt = new FixedBuffer32();
        let prk = this.extract(salt, inputKeyMaterial);
        return this.expand(prk, info, outputLength);
    }

    private extract(salt: FixedBuffer32, inputKeyMaterial: Buffer): Buffer {
        let cry = crypto.createHmac('sha256', salt.buffer);
        cry.update(inputKeyMaterial);
        return cry.digest();
    }

    private expand(prk: Buffer, info: Buffer, outputSize: number): Buffer {
        let iterations = Math.ceil(outputSize / HASH_OUTPUT_SIZE);
        let mixin = Buffer.allocUnsafe(0);

        let results = new BytesBuilder();
        let remainingBytes = outputSize;
        const offset = this.getIterationStartOffset();

        for (let i = offset; i < iterations + offset; ++i) {
            let cry = crypto.createHmac('sha256', prk);
            cry.update(mixin);
            if (info) {
                cry.update(info);
            }
            cry.update(BufferT.FromInt8(i));

            let stepResult = cry.digest();
            let stepSize = Math.min(remainingBytes, stepResult.byteLength);
            results.addBuffer(stepResult.subarray(0, stepSize));

            mixin = stepResult;
            remainingBytes -= stepSize;
        }

        return results.trim().buffer;
    }

    protected abstract getIterationStartOffset(): number;
}
