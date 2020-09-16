import {IdentityKeyStore} from "./identitykeystore";
import {PreKeyStore} from "./prekeystore";
import {SessionStore} from "./sessionstore";
import {SignedPreKeyStore} from "./signedprekeystore";

export interface ProtocolStore extends IdentityKeyStore, PreKeyStore, SessionStore, SignedPreKeyStore {

}