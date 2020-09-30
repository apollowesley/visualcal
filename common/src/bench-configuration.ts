// eslint-disable-next-line
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

interface Timing {
  connectTimeout: number;
  delayBeforeWrite?: number;
  delayAfterWrite?: number;
  delayBeforeRead?: number;
  delayAfterRead?: number;
}

export const DefaultTiming: Timing = {
  connectTimeout: 3000
}

export interface CommunicationInterfaceConfigurationInfo {
  name: string;
  type: CommunicationInterfaceType;
  nationalInstrumentsGpib?: NationalInstrumentsGpibConfiguration;
  tcp?: TcpConfiguration;
  serial?: SerialPortConfiguration;
  timing: Timing;
}

export interface BenchConfig {
  name: string;
  username: string;
  interfaces: CommunicationInterfaceConfigurationInfo[];
}
