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
  write(data: ArrayBufferLike): Promise<ArrayBufferLike>;
  read(): Promise<ArrayBufferLike>;
  readString(): Promise<string>;
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

interface DeviceNodeDriverRequirementsInfo {
  configNodeId: string;
  unitId: string;
  driverCategories?: string[]; // Only found on generic device nodes
  isGeneric?: boolean;
  isCustom?: boolean;
}

interface CommunicationInterfaceDeviceNodeConfiguration {
  configNodeId: string;
  unitId: string;
  interfaceName: string;
  gpib?: GpibDeviceConfiguration;
  gpibAddress: number;
  isGeneric?: boolean;
  isCustom?: boolean;
}

interface CommunicationConfiguration {
  benchConfigName?: string;
  devices: CommunicationInterfaceDeviceNodeConfiguration[];
}
