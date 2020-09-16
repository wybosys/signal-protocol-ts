import {HKDF} from "./HKDF";

export class HKDFv2 extends HKDF {

    protected getIterationStartOffset(): number {
        return 0;
    }
}