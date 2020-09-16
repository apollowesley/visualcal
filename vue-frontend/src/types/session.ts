export interface DeviceDriverInfo {
  manufacturer: string;
  deviceModel: string;
  categories: string[];
}

export interface GpibDeviceConfiguration {
  address: number;
}

export interface CommunicationInterfaceDeviceNodeConfiguration {
  configNodeId: string;
  unitId: string;
  interfaceName: string;
  gpib?: GpibDeviceConfiguration;
  gpibAddress: number;
  driverDisplayName: string;
  isGeneric?: boolean;
  driver?: DeviceDriverInfo;
}

export interface CommunicationConfiguration {
  benchConfigName?: string;
  devices: CommunicationInterfaceDeviceNodeConfiguration[];
}


export interface Session {
  name: string;
  username: string;
  procedureName: string;
  lastSectionName?: string;
  lastActionName?: string;
  configuration?: CommunicationConfiguration;
}
