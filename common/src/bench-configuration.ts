export const enum IpcChannels {
  GetSerialPortsRequest = 'get-serial-ports-request',
  GetSerialPortsResponse = 'get-serial-ports-response',
  GetSerialPortsError = 'get-serial-ports-error',
  SaveConfigsForCurrentUserRequest = 'save-bench-configs-for-current-user-request',
  SaveConfigsForCurrentUserResponse = 'save-bench-configs-for-current-user-response',
  SaveConfigsForCurrentUserError = 'save-bench-configs-for-current-user-error',
  Updated = 'bench-configs-for-current-user-updated'
}

export type CommunicationInterfaceType = 'National Instruments GPIB' | 'Prologix GPIB TCP' | 'Prologix GPIB USB' | 'Serial Port' | 'Emulated';

export const CommunicationInterfaceTypes = [
  'National Instruments GPIB',
  'Prologix GPIB TCP',
  'Prologix GPIB USB',
  'Serial Port',
  'Emulated'
]

interface TcpConfiguration {
  host: string;
  port: number;
}

interface NationalInstrumentsGpibConfiguration {
  address: number;
}

interface SerialPortConfiguration {
  port: string;
  baudRate: number;
}

export interface CommunicationInterfaceConfigurationInfo {
  name: string;
  type: CommunicationInterfaceType;
  nationalInstrumentsGpib?: NationalInstrumentsGpibConfiguration;
  tcp?: TcpConfiguration;
  serial?: SerialPortConfiguration;
}

export interface BenchConfig {
  name: string;
  username: string;
  interfaces: CommunicationInterfaceConfigurationInfo[];
}
