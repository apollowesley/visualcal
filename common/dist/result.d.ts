export declare const IpcChannels: {
    getAllBasicInfosForCurrentSession: {
        request: string;
        response: string;
        error: string;
    };
    getResultsForRun: {
        request: string;
        response: string;
        error: string;
    };
    runStarted: string;
    runStopped: string;
    resultAdded: string;
};
export interface Measurement<TRaw> {
    raw: TRaw;
}
export interface NumericMeasurement<TRaw, TValue> extends Measurement<TRaw> {
    raw: TRaw;
    value: TValue;
}
export interface LogicResultPassedCallback {
    (): boolean;
}
export interface LogicResult<TRaw, TValue> {
    id: string;
    runId: string;
    type: string;
    description: string;
    timestamp: Date;
    baseQuantity?: string;
    derivedQuantity?: string;
    derivedQuantityPrefix?: string;
    minimum?: number;
    maximum?: number;
    inputLevel: TValue;
    rawValue: TRaw;
    measuredValue: TValue;
    passed: boolean;
}
interface Note {
    id: string;
    enteredBy: string;
    comment: string;
}
export interface LogicRunBasicInfo {
    id: string;
    sessionId: string;
    sectionId: string;
    actionId: string;
    startTimestamp: Date;
    stopTimestamp?: Date;
    description: string;
    isCompleted?: boolean;
    notes?: Note[];
}
export interface LogEntry {
    id?: string;
    timestamp?: Date;
    name?: string;
    type?: string;
    message?: string;
    data?: ArrayBufferLike;
    error?: Error;
}
export interface LogicRun<TRaw, TValue> extends LogicRunBasicInfo {
    results: LogicResult<TRaw, TValue>[];
    communicationLogEntries?: LogEntry[];
    deviceLogEntries?: LogEntry[];
}
export {};
