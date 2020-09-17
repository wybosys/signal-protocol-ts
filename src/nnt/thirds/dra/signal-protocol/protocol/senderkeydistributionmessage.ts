import {CiphertextMessage, CiphertextMessageType} from "./ciphertextmessage";
import {PublicKey} from "../model/keypair";
import {BufferT} from "../../../../core/buffert";
import {SenderKeyDistributionMessageModel} from "../model/whispertext";

export class SenderKeyDistributionMessage extends CiphertextMessage {

    private _id: number;
    private _iteration: number;
    private _chainKey: PublicKey;
    private _signatureKey: PublicKey;
    private _serialized: Buffer;

    static Create(id: number, iteration: number, chainKey: PublicKey, signatureKey: PublicKey): SenderKeyDistributionMessage {
        let version = BufferT.FromInt16BE((this.CURRENT_VERSION << 8) | this.CURRENT_VERSION);

        let builder = new SenderKeyDistributionMessageModel();
        builder.id = id;
        builder.iteration = iteration;
        builder.chainKey = chainKey;
        builder.signingKey = signatureKey;
        let protobuf = builder.serialize();

        let r = new SenderKeyDistributionMessage();
        r._id = id;
        r._iteration = iteration;
        r._chainKey = chainKey;
        r._signatureKey = signatureKey;
        r._serialized = Buffer.concat([version, protobuf]);

        return r;
    }

    static Deserialize(serialized: Buffer): SenderKeyDistributionMessage {
        let messageParts = BufferT.SplitAs(serialized, 1, serialized.byteLength - 1);
        let version = messageParts[0].readInt8();
        let message = messageParts[1];

        if (version != this.CURRENT_VERSION) {
            console.error(`dra: 不支持版本消息 ${version}`);
            return null;
        }

        let distributionMessage = new SenderKeyDistributionMessageModel();
        distributionMessage.deserialize(message);

        if (distributionMessage.id == null ||
            distributionMessage.iteration == null ||
            distributionMessage.chainKey == null ||
            distributionMessage.signingKey == null) {
            console.error(`dra: 消息数据错误`);
            return null;
        }

        let r = new SenderKeyDistributionMessage();
        r._serialized = serialized;
        r._id = distributionMessage.id;
        r._iteration = distributionMessage.iteration;
        r._chainKey = distributionMessage.chainKey;
        r._signatureKey = distributionMessage.signingKey;

        return r;
    }

    serialize(): Buffer {
        return this._serialized;
    }

    type(): CiphertextMessageType {
        return CiphertextMessageType.SENDERKEY_DISTRIBUTION;
    }

    get iteration() {
        return this._iteration;
    }

    get chainKey() {
        return this._chainKey;
    }

    get signatureKey() {
        return this._signatureKey;
    }

    get id() {
        return this._id;
    }
}