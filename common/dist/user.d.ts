export declare const enum IpcChannels {
    Request = "user-login-request",
    Response = "user-login-response",
    Error = "user-login-error"
}
export interface LoginCredentials {
    username: string;
    password: string;
}
