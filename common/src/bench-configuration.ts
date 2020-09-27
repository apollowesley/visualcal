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
