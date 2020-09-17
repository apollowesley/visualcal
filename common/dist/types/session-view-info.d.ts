export declare enum IpcChannels {
    Request = "vue-session-view-info-request",
    Response = "vue-session-view-info-response",
    Error = "vue-session-view-info-error"
}
interface Author {
    name: string;
}
interface ProcedureAction {
    name: string;
    lastRun?: Date;
}
interface ProcedureSection {
    name: string;
    actions: ProcedureAction[];
}
interface Procedure {
    name: string;
    companyName: string;
    authors?: Author[];
    sections: ProcedureSection[];
}
interface AvailableInterfaceDriver {
    name: string;
}
interface AvailableDeviceDriver {
    name: string;
}
interface CommunicationInterface {
    name: string;
}
interface Device {
    name: string;
    selectedDeviceDriverName?: string;
    selectedCommunicationInterfaceName?: string;
    gpibAddress?: number;
    isGpib?: boolean;
}
export interface SessionViewRequestResponseInfo {
    procedure: Procedure;
    communication: {
        devices: Device[];
        interfaces: CommunicationInterface[];
        availableDeviceDrivers: AvailableDeviceDriver[];
        availableInterfaceDrivers: AvailableInterfaceDriver[];
    };
}
export {};
