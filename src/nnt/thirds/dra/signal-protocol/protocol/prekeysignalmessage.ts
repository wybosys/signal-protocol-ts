import {CiphertextMessage} from "./ciphertextmessage";
import {IdentityKey, PublicKey} from "../keypair";
import {SignalMessage} from "../model/whispertext";

export class PreKeySignalMessage extends CiphertextMessage {

    private _version: number;
    private _registrationId: number;
    private _preKeyId?: number;
    private _signedPreKeyId: number;
    private _baseKey: PublicKey;
    private _identityKey: IdentityKey;
    private _message: SignalMessage;
    private _serialized: Buffer;

    static Deserialize(serialized: Buffer): PreKeySignalMessage {
        let r = new PreKeySignalMessage();
        r._version = serialized.readInt8();
        if (r._version != CiphertextMessage.CURRENT_VERSION) {
            console.error(`dra: 不支持的版本 ${r._version}`);
            return null;
        }

        return r;
    }
}