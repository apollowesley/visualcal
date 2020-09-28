/*eslint-env es6*/

export const enum IpcChannels {
  Request = 'vue-session-view-info-request',
  Response = 'vue-session-view-info-response',
  Error = 'vue-session-view-info-error'
};

export interface Author {
  nameFirst: string;
  nameLast: string;
  email?: string;
}

export interface ProcedureAction {
  name: string;
  lastRun?: Date;
}

export interface ProcedureSection {
  name: string;
  actions: ProcedureAction[];
}

export interface Procedure {
  name: string;
  authorOrganization: string;
  authors?: Author[];
  sections: ProcedureSection[];
}

export interface Session {
  name: string;
  procedureName: string;
  email: string;
}

export interface AvailableInterfaceDriver {
  name: string;
}

export interface AvailableDeviceDriver {
  name: string;
}

export interface CommunicationInterface {
  name: string;
}

export interface Device {
  name: string;
  selectedDeviceDriverName?: string;
  selectedCommunicationInterfaceName?: string;
  gpibAddress?: number;
  isGpib?: boolean;
}

export interface SessionViewRequestResponseInfo {
  procedure: Procedure;
  communication?: {
    devices: Device[];
    interfaces: CommunicationInterface[];
    availableDeviceDrivers: AvailableDeviceDriver[];
    availableInterfaceDrivers: AvailableInterfaceDriver[];
  };
}
