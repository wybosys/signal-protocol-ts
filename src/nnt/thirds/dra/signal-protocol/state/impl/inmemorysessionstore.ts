import {SessionStore} from "../sessionstore";
import {Address} from "../../address";
import {SessionRecord} from "../sessionrecord";

export class InMemorySessionStore implements SessionStore {

    private _sessions = new Map<number, Buffer>();
    private _addresses = new Map<number, Address>();

    async loadSession(address: Address): Promise<SessionRecord> {
        if (await this.containsSession(address)) {
            return SessionRecord.Deserialize(this._sessions.get(address.hash));
        }

        return new SessionRecord();
    }

    async getSubDeviceSessions(name: string): Promise<number[]> {
        let deviceIds: number[] = [];

        this._addresses.forEach((v, k) => {
            if (v.name == name && v.deviceId != 1) {
                deviceIds.push(v.deviceId);
            }
        });

        return deviceIds;
    }

    async storeSession(address: Address, record: SessionRecord): Promise<void> {
        this._sessions.set(address.hash, record.serialize());
        this._addresses.set(address.hash, address);
    }

    async containsSession(address: Address): Promise<boolean> {
        return this._sessions.has(address.hash);
    }

    async deleteSession(address: Address): Promise<void> {
        this._sessions.delete(address.hash);
        this._addresses.delete(address.hash);
    }

    async deleteAllSessions(name: string): Promise<void> {
        this._addresses.forEach((v, k) => {
            if (v.name == name) {
                this._addresses.delete(k);
                this._sessions.delete(k);
            }
        });
    }

}