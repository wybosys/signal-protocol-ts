import {SenderKeyStore} from "./state/senderkeystore";
import {SenderKeyName} from "./senderkeyname";
import {SenderKeyDistributionMessage} from "../protocol/senderkeydistributionmessage";
import {Crypto} from "../crypto";
import {FixedBuffer32} from "../../../../core/buffer";
import {PublicKey} from "../model/publickey";

export class GroupSessionBuilder {

    private _senderKeyStore: SenderKeyStore;

    constructor(store: SenderKeyStore) {
        this._senderKeyStore = store;
    }

    async process(senderKeyName: SenderKeyName, senderKeyDistributionMessage: SenderKeyDistributionMessage) {
        let senderKeyRecord = await this._senderKeyStore.loadSenderKey(senderKeyName);
        senderKeyRecord.addSenderKeyState(
            senderKeyDistributionMessage.id,
            senderKeyDistributionMessage.iteration,
            senderKeyDistributionMessage.chainKey,
            senderKeyDistributionMessage.signatureKey
        );
        await this._senderKeyStore.storeSenderKey(senderKeyName, senderKeyRecord);
    }

    async create(senderKeyName: SenderKeyName): Promise<SenderKeyDistributionMessage> {
        let senderKeyRecord = await this._senderKeyStore.loadSenderKey(senderKeyName);

        if (senderKeyRecord.isEmpty()) {
            senderKeyRecord.setSenderKeyState(
                Crypto.GenerateSenderKeyId(),
                0,
                new PublicKey(Crypto.GenerateSenderKey()),
                Crypto.GenerateSenderSigningKey()
            );

            await this._senderKeyStore.storeSenderKey(senderKeyName, senderKeyRecord);
        }

        let state = senderKeyRecord.getSenderKeyState();
        return SenderKeyDistributionMessage.Create(
            state.keyId,
            state.getSenderChainKey().iteration,
            new PublicKey(new FixedBuffer32(state.getSenderChainKey().seed)),
            state.signingKeyPublic
        );
    }
}