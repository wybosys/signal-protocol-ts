import {SessionState} from "./sessionstate";
import {RecordStructureModel, SessionStructureModel} from "../model/localstorage";
import {ArrayT} from "../../../../core/arrayt";
import {ISerializableObject} from "../../../../core/object";
import {use} from "../../../../core/kernel";

export class SessionRecord implements ISerializableObject {

    static ARCHIVED_STATES_MAX_LENGTH = 40;

    private _sessionState = SessionState.Create();
    private _previousStates: SessionState[] = [];
    private _fresh = false;

    constructor() {
    }

    static Create(): SessionRecord {
        let r = new SessionRecord();
        r._fresh = true;
        return r;
    }

    static CreateByState(sessionState: SessionState): SessionRecord {
        let r = new SessionRecord();
        r._sessionState = sessionState;
        r._fresh = false;
        return r;
    }

    static Deserialize(serialized: Buffer): SessionRecord {
        let record = new RecordStructureModel().deserialize(serialized);
        let r = new SessionRecord();
        r._sessionState = SessionState.CreateByStructure(record.currentSession);
        r._fresh = false;
        record.previousSessions.forEach(e => {
            r._previousStates.push(SessionState.CreateByStructure(e));
        });
        return r;
    }

    hasSessionState(version: number, aliceBaseKey: Buffer): boolean {
        if (this._sessionState.sessionVersion == version && aliceBaseKey.compare(this._sessionState.aliceBaseKey.forSerialize.buffer) == 0) {
            return true;
        }

        for (let i = 0; i < this._previousStates.length; ++i) {
            let state = this._previousStates[i];
            if (aliceBaseKey.compare(state.aliceBaseKey.forSerialize.buffer) == 0) {
                return true;
            }
        }

        return false;
    }

    get sessionState() {
        return this._sessionState;
    }

    get previousSessionStates() {
        return this._previousStates;
    }

    removePreviousSessionStates() {
        this._previousStates.length = 0;
    }

    isFresh() {
        return this._fresh;
    }

    archiveCurrentState() {
        this.promoteState(SessionState.Create());
    }

    promoteState(promotedState: SessionState) {
        ArrayT.InsertObjectAtIndex(this._previousStates, this._sessionState, 0);
        this._sessionState = promotedState;

        if (this._previousStates.length > SessionRecord.ARCHIVED_STATES_MAX_LENGTH) {
            this._previousStates.pop();
        }
    }

    setState(sessionState: SessionState) {
        this._sessionState = sessionState;
    }

    serialize(): Buffer {
        let previousStructures: SessionStructureModel[] = [];
        this._previousStates.forEach(e => {
            previousStructures.push(e.structure);
        });

        let record = use(new RecordStructureModel(), m => {
            m.currentSession = this._sessionState.structure;
            m.previousSessions = previousStructures;
        });

        return record.serialize();
    }

    deserialize(buf: Buffer): this {
        return null;
    }
}