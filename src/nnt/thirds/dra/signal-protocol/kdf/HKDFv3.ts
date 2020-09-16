import {HKDF} from "./HKDF";

export class HKDFv3 extends HKDF {

    protected getIterationStartOffset(): number {
        return 1;
    }
}
