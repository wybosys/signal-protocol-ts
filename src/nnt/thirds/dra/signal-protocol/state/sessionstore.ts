import {Address} from "../address";
import {SessionRecord} from "./sessionrecord";

export interface SessionStore {

    loadSession(address: Address): Promise<SessionRecord>;

    getSubDeviceSessions(name: string): Promise<number[]>;

    storeSession(address: Address, record: SessionRecord): Promise<void>;

    containsSession(address: Address): Promise<boolean>;

    deleteSession(address: Address): Promise<void>;

    deleteAllSessions(name: string): Promise<void>;
}