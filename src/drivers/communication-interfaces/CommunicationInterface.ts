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
  beforeRead: (iface: ICommunicationInterface) => void;
  afterRead:  (iface: ICommunicationInterface, data: ArrayBuffer) => void;
  stringReceived: (iface: ICommunicationInterface, data: string) => void;
  error: (iface: ICommunicationInterface, err: Error) => void;
}

export abstract class CommunicationInterface extends TypedEmitter<Events> implements ICommunicationInterface {

  private fName: string = uuid();
  private fConnectTimeout = 3000;
  private fConnectTimeoutTimerId?: NodeJS.Timeout;
  private fReadTimeout = 3000;
  private fWriteTimeout = 3000;
  private fResetOnConnect = true;
  private fDelayBeforeWrite = 0;
  private fDelayAfterWrite = 0;
  private fDelayBeforeRead = 0;
  private fDelayAfterRead = 0;
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

  get readTimeout() { return this.fReadTimeout; }
  set readTimeout(value: number) {
    if (value < 0) throw new Error('readTimeout cannot be less than zero');
    if (value === this.fConnectTimeout) return;
    this.fReadTimeout = value;
  }

  get writeTimeout() { return this.fWriteTimeout; }
  set writeTimeout(value: number) {
    if (value < 0) throw new Error('writeTimeout cannot be less than zero');
    if (value === this.fConnectTimeout) return;
    this.fWriteTimeout = value;
  }

  get resetOnConnect() { return this.fResetOnConnect; }
  set resetOnConnect(value: boolean) { this.fResetOnConnect = value; }

  get delayBeforeWrite() { return this.fDelayBeforeWrite >= 0 ? this.fDelayBeforeWrite : 0; }
  set delayBeforeWrite(value: number) {
    if (value < 0) value = 0;
    this.fDelayBeforeWrite = value;
  }

  get delayAfterWrite() { return this.fDelayAfterWrite >= 0 ? this.fDelayAfterWrite : 0; }
  set delayAfterWrite(value: number) {
    if (value < 0) value = 0;
    this.fDelayAfterWrite = value;
  }

  get delayBeforeRead() { return this.fDelayBeforeRead >= 0 ? this.fDelayBeforeRead : 0; }
  set delayBeforeRead(value: number) {
    if (value < 0) value = 0;
    this.fDelayBeforeRead = value;
  }

  get delayAfterRead() { return this.fDelayAfterRead >= 0 ? this.fDelayAfterRead : 0; }
  set delayAfterRead(value: number) {
    if (value < 0) value = 0;
    this.fDelayAfterRead = value;
  }

  get isConnecting() { return this.fIsConnecting; }
  get isDisconnecting() { return this.fIsDisconnecting; }

  protected abstract getIsConnected(): boolean;

  get isConnected() { return !this.fIsConnecting && this.getIsConnected() };

  protected async onDisconnecting(): Promise<void> {
    this.fIsConnecting = false;
    this.fIsDisconnecting = true;
    setImmediate(() => this.emit('disconnecting', this));
    await Promise.resolve();
  }

  protected async onDisconnected(): Promise<void> {
    this.fIsDisconnecting = false;
    setImmediate(() => this.emit('disconnected', this));
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
      setImmediate(() => this.emit('connecting', this));
      this.fConnectTimeoutTimerId = setTimeout(async () => {
        await this.disconnect();
        const err = new Error(`${this.name} failed to connect within ${this.connectTimeout} ms`);
        return reject(err);
      }, this.connectTimeout);
      return resolve();
    });
  }

  protected async onConnected(): Promise<void> {
    if (this.fConnectTimeoutTimerId) clearTimeout(this.fConnectTimeoutTimerId);
    this.fConnectTimeoutTimerId = undefined;
    this.fIsConnecting = false;
    setImmediate(() => this.emit('connected', this));
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
    setImmediate(() => this.emit('error', this, error));
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

  abstract write(data: ArrayBufferLike): Promise<ArrayBufferLike>;
  abstract read(opts?: {}): Promise<ArrayBufferLike>;

  protected async onBeforeWrite(data: ArrayBufferLike) {
    if (this.delayBeforeWrite) await sleep(this.delayBeforeWrite);
    this.emit('beforeWrite', this, data);
    await Promise.resolve();
  }

  protected async onAfterWrite(data: ArrayBufferLike) {
    if (this.delayAfterWrite) await sleep(this.delayAfterWrite);
    this.emit('afterWrite', this, data);
    await Promise.resolve();
  }

  async writeData(data: ArrayBufferLike) {
    if (!this.isConnected || this.isDisconnecting) return;
    await this.onBeforeWrite(data);
    const actualWroteData = await this.write(data);
    await this.onAfterWrite(actualWroteData);
  }

  protected async onBeforeRead() {
    if (this.delayBeforeRead) await sleep(this.delayBeforeRead);
    setImmediate(() => this.emit('beforeRead', this));
    await Promise.resolve();
  }

  protected async onAfterRead(data: ArrayBufferLike) {
    if (this.delayAfterRead) await sleep(this.delayAfterRead);
    setImmediate(() => this.emit('afterRead', this, data));
    await Promise.resolve();
  }

  async readData(opts?: {}): Promise<ArrayBufferLike> {
    await this.onBeforeRead();
    const data = await this.read(opts);
    await this.onAfterRead(data);
    setImmediate(() => this.emit('dataReceived', this, data));
    return data;
  }

  async readString(opts?: {}): Promise<string> {
    const data = await this.readData(opts);
    const dataString = new TextDecoder().decode(data);
    setImmediate(() => this.emit('stringReceived', this, dataString));
    return dataString;
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

  async queryString(data: string, encoding: BufferEncoding = 'utf-8', opts?: {}): Promise<string> {
    await this.writeString(data, encoding);
    return await this.readString(opts);
  }

}
