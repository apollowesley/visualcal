declare type CommunicationInterfaceEvents = 'connected' | 'disconnected' | 'data' | 'error' | 'write';

interface CommunicationInterfaceConfigurationOptions {
  id: string;
  connectTimeout?: number;
  readTimeout?: number;
  writeTimeout?: number
}

interface ICommunicationInterface {
  setDeviceAddress(address: number): Promise<void>; // GPIB
  enable(): void;
  disable(): void;
  on(event: CommunicationInterfaceEvents, listener: (...args: any[]) => void): void;
  off(event: CommunicationInterfaceEvents, listener: (...args: any[]) => void): void;
  addConnectedHandler(handler: ConnectedEventHandler): void;
  removeConnectedHandler(handler: ConnectedEventHandler): void;
  addDisconnectedHandler(handler: DisconnectedEventHandler): void;
  removeDisconnectedHandler(handler: DisconnectedEventHandler): void;
  addErrorHandler(handler: ErrorEventHandler): void;
  removeErrorHandler(handler: ErrorEventHandler): void;
  connect(options?: ICommunicationInterfaceConnectOptions): Promise<void>;
  disconnect(): void;
  isConnected: boolean;
  configure(options: CommunicationInterfaceConfigurationOptions): void;
  writeData(data: ArrayBuffer, readHandler?: ReadQueueItem): Promise<void>;
  writeInt8(data: number, readHandler?: ReadQueueItem): Promise<void>;
  writeUInt8(data: number, readHandler?: ReadQueueItem): Promise<void>;
  writeInt16(data: number, readHandler?: ReadQueueItem): Promise<void>;
  writeUInt16(data: number, readHandler?: ReadQueueItem): Promise<void>;
  writeInt32(data: number, readHandler?: ReadQueueItem): Promise<void>;
  writeUInt32(data: number, readHandler?: ReadQueueItem): Promise<void>;
  writeInt64(data: bigint, readHandler?: ReadQueueItem): Promise<void>;
  writeUInt64(data: bigint, readHandler?: ReadQueueItem): Promise<void>;
  writeFloat32(data: number, readHandler?: ReadQueueItem): Promise<void>;
  writeFloat64(data: number, readHandler?: ReadQueueItem): Promise<void>;
  writeString(data: string, encoding?: BufferEncoding, readHandler?: ReadQueueItem): Promise<void>;
  queryString(data: string, encoding?: BufferEncoding): Promise<string>;
}

interface IControllableDevice {
  getCommunicationInterface(): ICommunicationInterface | null;
  setCommunicationInterface(communicationInterface: ICommunicationInterface): void;
  isGpib?: boolean;
  gpibPrimaryAddress?: number;
}

interface DeviceInfo {
  manufacturer: string;
  model: string;
  nomenclature: string;
}

interface InterfaceOperation {
  type: 'write' | 'query' | 'trigger' | 'delay' | 'reset' | 'command';
  respondInBulk?: boolean;
  commandType?: string;
  unitId?: string;
  readLength?: number;
  useReadLength?: boolean;
  responseTag?: string;
  readDataType?: string;
  writeData?: number | string | Uint8Array;
  delay?: number;
  resetType?: string;
  interfaceId?: string;
  triggerName?: string;
  // eslint-disable-next-line
  readTag?: any;
  gpibAddress?: number;
}

interface InterfaceOperationInfo {
  operation: InterfaceOperation;
  section: string;
  action: string;
  readTag: string;
}

interface InterfaceOperationResponseMessage {
  data: Uint8Array;
  readOperation: InterfaceOperationInfo;
  section: string;
  action: string;
  readTag: string;
}

interface ReadQueueItem {
  callback: (data: ArrayBuffer) => void;
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
  getEndOfStringTerminator(): Promise<EndOfStringTerminator>;
  setEndOfStringTerminator(eos: EndOfStringTerminator): Promise<void>;
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
  (): void;
}

interface ConnectedEventHandler {
  (err?: Error): void;
}

interface ErrorEventHandler {
  (err: Error): void;
}

interface DisconnectedEventHandler {
  (err?: Error): void;
}

interface DataEventHandler {
  (data: ArrayBuffer): void;
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

interface CommunicationInterfaceInfo {
  name: string;
  type: import('./constants').CommunicationInterfaceType;
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
  interfaces: CommunicationInterfaceInfo[];
  devices: CommunicationInterfaceDeviceNodeConfiguration[];
}
