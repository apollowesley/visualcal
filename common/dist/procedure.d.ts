export declare const enum IpcChannels {
    GetProceduresRequest = "procedures-get-request",
    GetProceduresResponse = "procedures-get-response",
    GetProceduresError = "procedures-get-error"
}
export interface ProcedureForCreate {
    name: string;
    description: string;
    version: string;
}
