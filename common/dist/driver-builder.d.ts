export declare const IpcChannels: {
    communicationInterface: {
        getStatus: {
            request: string;
            response: string;
            error: string;
        };
        connect: {
            request: string;
            response: string;
            error: string;
        };
        disconnect: {
            request: string;
            response: string;
            error: string;
        };
        write: {
            request: string;
            response: string;
            error: string;
        };
        read: {
            request: string;
            response: string;
            error: string;
        };
        queryString: {
            request: string;
            response: string;
            error: string;
        };
    };
};
export interface Status {
    communicationInterfaceName?: string;
    isConnected: boolean;
}
export interface CommunicationInterfaceActionInfo {
    deviceGpibAddress?: number;
    delayBefore?: number;
    delayAfter?: number;
    terminator?: string;
}
export interface WriteInfo extends CommunicationInterfaceActionInfo {
    data: ArrayBufferLike;
}
export interface QueryStringInfo extends CommunicationInterfaceActionInfo {
    data: string;
}
