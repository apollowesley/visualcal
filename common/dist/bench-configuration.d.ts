export declare type CommunicationInterfaceType = 'National Instruments GPIB' | 'Prologix GPIB TCP' | 'Prologix GPIB USB' | 'Serial Port' | 'Emulated';
export declare const CommunicationInterfaceTypes: string[];
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
export {};
