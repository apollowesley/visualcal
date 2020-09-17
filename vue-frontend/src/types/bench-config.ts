export type CommunicationInterfaceType = 'National Instruments GPIB' | 'Serial Port' | 'Prologix GPIB TCP' | 'Prologix GPIB USB' | 'Emulated';

interface NationalInstrumentsGpibConfiguration {
  unitId: string;
}

interface TcpConfiguration {
  host: string;
  port: number;
}

interface SerialPortConfiguration {
  port: string;
  baudRate: number;
}

interface GpibInterfaceConfiguration {
  address: number;
}

interface CommunicationInterfaceConfigurationInfo {
  name: string;
  type: CommunicationInterfaceType;
  nationalInstrumentsGpib?: NationalInstrumentsGpibConfiguration;
  tcp?: TcpConfiguration;
  serial?: SerialPortConfiguration;
  gpib?: GpibInterfaceConfiguration;
}

export interface BenchConfig {
  name: string;
  username: string;
  interfaces: CommunicationInterfaceConfigurationInfo[];
}
