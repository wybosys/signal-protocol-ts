import {SenderKeyName} from "../senderkeyname";
import {SenderKeyRecord} from "./senderkeyrecord";

export interface SenderKeyStore {

    storeSenderKey(senderKeyName: SenderKeyName, record: SenderKeyRecord): Promise<void>;

    loadSenderKey(senderKeyName: SenderKeyName): Promise<SenderKeyRecord>;
}