interface CommunicationInterfaceConfigurationOptions {
  id: string;
  connectTimeout?: number;
  readTimeout?: number;
  writeTimeout?: number
}

interface ICommunicationInterface {
  name: string;
  setDeviceAddress(address: number): Promise<void>; // GPIB
  connect(options?: ICommunicationInterfaceConnectOptions): Promise<void>;
  disconnect(): Promise<void>;
  isConnected: boolean;
  configure(options: CommunicationInterfaceConfigurationOptions): void;
  getEndOfStringTerminator(): Promise<EndOfStringTerminator>;
  setEndOfStringTerminator(eos: EndOfStringTerminator): Promise<void>;
  writeData(data: ArrayBuffer): Promise<void>;
  writeInt8(data: number): Promise<void>;
  writeUInt8(data: number): Promise<void>;
  writeInt16(data: number): Promise<void>;
  writeUInt16(data: number): Promise<void>;
  writeInt32(data: number): Promise<void>;
  writeUInt32(data: number): Promise<void>;
  writeInt64(data: bigint): Promise<void>;
  writeUInt64(data: bigint): Promise<void>;
  writeFloat32(data: number): Promise<void>;
  writeFloat64(data: number): Promise<void>;
  writeString(data: string, encoding?: BufferEncoding): Promise<void>;
  queryString(data: string, encoding?: BufferEncoding): Promise<string>;
  write(data: ArrayBufferLike): Promise<void>;
  read(): Promise<ArrayBufferLike>;
  readString(): Promise<string>;
}

interface IControllableDevice extends IDevice {
  name: string;
  communicationInterface?: ICommunicationInterface;
  setCommunicationInterface(communicationInterface: ICommunicationInterface): void;
  isGpib?: boolean;
  gpibPrimaryAddress?: number;
}

interface ReadQueueItem {
  callback: (data: ArrayBuffer, cancelled = false) => void;
  cancelCallback?: () => void;
}

type EndOfStringTerminator = 'CrLf' | 'Cr' | 'Lf' | 'none';

interface EndOfTransmissionOptions {
  enabled: boolean;
  character: number;
}

declare const enum StatusByteRegisterValues {
  None = 0,
  MessageAvailable = 1 << 4,
  EventSummary = 1 << 5,
  RequestingService = 1 << 6
}

declare const enum EventStatusRegisterValues {
  None = 0,
  OperationComplete = 1 << 0,
  RequestingControl = 1 << 1,
  QueryError = 1 << 2,
  DeviceSpecificError = 1 << 3,
  ExecutionError = 1 << 4,
  CommandError = 1 << 5,
  UserRequest = 1 << 6,
  PoweredOn = 1 << 7
}

interface GpibInterface extends ICommunicationInterface {
  address: number;
  selectedDeviceClear(address?: number): Promise<void>;
  getEndOfInstruction(): Promise<boolean>;
  setEndOfInstruction(enable: boolean): Promise<void>;
  getEndOfTransmission(): Promise<EndOfTransmissionOptions>;
  setEndOfTransmission(options: EndOfTransmissionOptions): Promise<void>;
  becomeControllerInCharge(): Promise<void>;
  gotToRemote(address: number): Promise<void>;
  goToLocal(address: number): Promise<void>;
  getListenOnly(): Promise<boolean>;
  setListenOnly(enable: boolean): Promise<void>;
  reset(): Promise<void>;
  serialPoll(primaryAddress: number, secondaryAddress?: number): Promise<StatusByteRegisterValues>;
  readStatusByte(): Promise<StatusByteRegisterValues>;
  readEventStatusRegister(): Promise<EventStatusRegisterValues>;
  getEventStatusEnable(): Promise<EventStatusRegisterValues>;
  setEventStatusEnable(values: EventStatusRegisterValues): Promise<void>;
  clearEventStatusEnable(): Promise<void>;
  trigger(addresses: number | number[]): Promise<void>;
}

interface ConnectingEventHandler {
  (iface: ICommunicationInterface): void;
}

interface ConnectedEventHandler {
  (iface: ICommunicationInterface, err?: Error): void;
}

interface ErrorEventHandler {
  (iface: ICommunicationInterface, err: Error): void;
}

interface DisconnectedEventHandler {
  (iface: ICommunicationInterface, err?: Error): void;
}

interface DataEventHandler {
  (iface: ICommunicationInterface, data: ArrayBuffer): void;
}

interface TcpConfiguration {
  host: string;
  port: number;
}

interface GpibInterfaceConfiguration {
  address: number;
}

interface GpibDeviceConfiguration {
  address: number;
}

interface NationalInstrumentsGpibConfiguration {
  unitId: string;
}

interface SerialPortConfiguration {
  port: string;
  baudRate: number;
}

interface CommunicationInterfaceConfigurationInfo {
  name: string;
  type: import('../constants').CommunicationInterfaceType;
  nationalInstrumentsGpib?: NationalInstrumentsGpibConfiguration;
  tcp?: TcpConfiguration;
  serial?: SerialPortConfiguration;
  gpib?: GpibInterfaceConfiguration;
}

interface DeviceNodeDriverRequirementsInfo {
  configNodeId: string;
  unitId: string;
  driverCategories?: string[]; // Only found on generic device nodes
  availableDrivers: import('./drivers-package-json').DriversPackageJsonDriver[];
  isGeneric?: boolean;
}

interface DeviceDriverInfo {
  manufacturer: string;
  deviceModel: string;
  categories: string[];
}

interface CommunicationInterfaceDeviceNodeConfiguration {
  configNodeId: string;
  unitId: string;
  interfaceName: string;
  gpib?: GpibDeviceConfiguration;
  gpibAddress: number;
  driverDisplayName: string;
  isGeneric?: boolean;
  driver?: DeviceDriverInfo;
}

interface CommunicationConfiguration {
  benchConfigName?: string;
  devices: CommunicationInterfaceDeviceNodeConfiguration[];
}
