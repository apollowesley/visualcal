import { v4 as uuid } from 'uuid';
import { TextDecoder } from 'util';
import { TypedEmitter } from 'tiny-typed-emitter';
import electronLog from 'electron-log';
import { sleep } from '../utils';

const log = electronLog.scope('CommunicationInterface');

interface Events {
  connecting: (iface: ICommunicationInterface) => void;
  connected: (iface: ICommunicationInterface, err?: Error) => void;
  disconnecting: (iface: ICommunicationInterface, err?: Error) => void;
  disconnected: (iface: ICommunicationInterface, err?: Error) => void;
  dataReceived: (iface: ICommunicationInterface, data: ArrayBuffer) => void;
  beforeWrite: (iface: ICommunicationInterface, data: ArrayBuffer) => void;
  afterWrite:  (iface: ICommunicationInterface, data: ArrayBuffer) => void;
  stringReceived: (iface: ICommunicationInterface, data: string) => void;
  error: (iface: ICommunicationInterface, err: Error) => void;
}

export abstract class CommunicationInterface extends TypedEmitter<Events> implements ICommunicationInterface {

  private fName: string = uuid();
  private fConnectTimeout = 3000;
  private fConnectTimeoutTimerId?: NodeJS.Timeout;
  private fIsConnecting = false;
  private fIsDisconnecting = false;
  private fEndOfStringTerminator: EndOfStringTerminator = 'CrLf';
  protected fOptions?: CommunicationInterfaceConfigurationOptions = undefined;

  async setDeviceAddress(address: number): Promise<void> {
    // GPIB
    await Promise.resolve();
  }

  get name() { return this.fName; }
  set name(value: string) { this.fName = value; }

  async getEndOfStringTerminator(): Promise<EndOfStringTerminator> {
    return await Promise.resolve(this.fEndOfStringTerminator);
  }

  protected getEndOfStringTerminatorChars() {
    switch (this.fEndOfStringTerminator) { 
      case 'Cr':
        return '\r';
      case 'CrLf':
        return '\r\n';
      case 'Lf':
        return '\n';
      case 'none':
        return '';
    }
  }

  async setEndOfStringTerminator(eos: EndOfStringTerminator): Promise<void> {
    this.fEndOfStringTerminator = eos;
    await Promise.resolve();
  }

  get connectTimeout() { return this.fConnectTimeout; }
  set connectTimeout(value: number) {
    if (value < 0) throw new Error('connectTimout cannot be less than zero');
    if (value === this.fConnectTimeout) return;
    this.fConnectTimeout = value;
  }

  get isConnecting() { return this.fIsConnecting; }
  get isDisconnecting() { return this.fIsDisconnecting; }

  protected abstract getIsConnected(): boolean;

  get isConnected() { return !this.fIsConnecting && this.getIsConnected() };

  protected async onDisconnecting(): Promise<void> {
    this.fIsConnecting = false;
    this.fIsDisconnecting = true;
    this.emit('disconnecting', this);
    await Promise.resolve();
  }

  protected async onDisconnected(): Promise<void> {
    this.fIsDisconnecting = false;
    this.emit('disconnected', this);
    await Promise.resolve();
  };

  protected abstract onDisconnect(): Promise<void>;

  async disconnect() {
    if (!this.isConnected || this.isDisconnecting) return; // Already disconnected or disconnecting
    await this.onDisconnecting();
    await this.onDisconnect();
    await this.onDisconnected();
  }

  protected onConnecting(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fIsConnecting = true;
      this.fIsDisconnecting = false;
      this.emit('connecting', this);
      this.fConnectTimeoutTimerId = setTimeout(async () => {
        await this.disconnect();
        const err = new Error(`${this.name} failed to connect within ${this.connectTimeout} ms`);
        this.onError(err);
        return reject(err);
      }, this.connectTimeout);
      return resolve();
    });
  }

  protected async onConnected(): Promise<void> {
    if (this.fConnectTimeoutTimerId) clearTimeout(this.fConnectTimeoutTimerId);
    this.fConnectTimeoutTimerId = undefined;
    this.fIsConnecting = false;
    this.emit('connected', this);
    return await Promise.resolve();
  }

  protected abstract onConnect(): Promise<void>;

  async connect(): Promise<void> {
    if (this.fIsConnecting) {
      throw new Error('Already connecting');
    }
    await this.onConnecting();
    try {
      await this.onConnect();
      await this.onConnected();
    } catch (error) {
      await this.disconnect();
      this.onError(error);
      throw error;
    }
  }

  addErrorHandler(handler: ErrorEventHandler) {
    this.on('error', handler);
  }

  removeErrorHandler(handler: ErrorEventHandler) {
    this.off('error', handler);
  }

  protected onError(error: Error) {
    this.emit('error', this, error);
  }

  configure(options: CommunicationInterfaceConfigurationOptions) {
    if (this.isConnected) {
      const err = new Error('Cannot configure while connected');
      this.onError(err);
      throw err;
    } else {
      this.fOptions = options;
    }
  }

  abstract write(data: ArrayBufferLike): Promise<void>;
  abstract read(): Promise<ArrayBufferLike>;

  protected async onBeforeWrite(data: ArrayBufferLike) {
    this.emit('beforeWrite', this, data);
    await Promise.resolve();
  }

  protected async onAfterWrite(data: ArrayBufferLike) {
    this.emit('afterWrite', this, data);
    await Promise.resolve();
  }

  async writeData(data: ArrayBufferLike) {
    await this.onBeforeWrite(data);
    await this.write(data);
    await this.onAfterWrite(data);
    await sleep(100);
  }

  async readString(): Promise<string> {
    const data = await this.read();
    return new TextDecoder().decode(data);
  }

  async writeInt8(data: number): Promise<void> {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer, 0, buffer.byteLength);
    view.setInt8(0, data);
    await this.writeData(buffer);
  }

  async writeUInt8(data: number): Promise<void> {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer, 0, buffer.byteLength);
    view.setUint8(0, data);
    await this.writeData(buffer);
  }

  async writeInt16(data: number): Promise<void> {
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer, 0, buffer.byteLength);
    view.setInt16(0, data);
    await this.writeData(buffer);
  }

  async writeUInt16(data: number): Promise<void> {
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer, 0, buffer.byteLength);
    view.setUint16(0, data);
    await this.writeData(buffer);
  }

  async writeInt32(data: number): Promise<void> {
    const buffer = new ArrayBuffer(32);
    const view = new DataView(buffer, 0, buffer.byteLength);
    view.setInt32(0, data);
    await this.writeData(buffer);
  }

  async writeUInt32(data: number): Promise<void> {
    const buffer = new ArrayBuffer(32);
    const view = new DataView(buffer, 0, buffer.byteLength);
    view.setUint32(0, data);
    await this.writeData(buffer);
  }

  async writeInt64(data: bigint): Promise<void> {
    const buffer = new ArrayBuffer(64);
    const view = new DataView(buffer, 0, buffer.byteLength);
    view.setBigInt64(0, data);
    await this.writeData(buffer);
  }

  async writeUInt64(data: bigint): Promise<void> {
    const buffer = new ArrayBuffer(64);
    const view = new DataView(buffer, 0, buffer.byteLength);
    view.setBigUint64(0, data);
    await this.writeData(buffer);
  }

  async writeFloat32(data: number): Promise<void> {
    const buffer = new ArrayBuffer(64);
    const view = new DataView(buffer, 0, buffer.byteLength);
    view.setFloat32(0, data);
    await this.writeData(buffer);
  }

  async writeFloat64(data: number): Promise<void> {
    const buffer = new ArrayBuffer(64);
    const view = new DataView(buffer, 0, buffer.byteLength);
    view.setFloat64(0, data);
    await this.writeData(buffer);
  }

  async writeString(data: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
    const buffer = Buffer.from(data, encoding);
    await this.writeData(buffer);
  }

  async queryString(data: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
    await this.writeString(data, encoding);
    return await this.readString();
  }

}
