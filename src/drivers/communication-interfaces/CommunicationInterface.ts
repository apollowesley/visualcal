import Denque from 'denque';
import { v4 as uuid } from 'uuid';
import { TextDecoder } from 'util';
import { TypedEmitter } from 'tiny-typed-emitter';
import electronLog from 'electron-log';

const log = electronLog.scope('CommunicationInterface');

interface Events {
  connecting: (iface: ICommunicationInterface) => void;
  connected: (iface: ICommunicationInterface, err?: Error) => void;
  disconnecting: (iface: ICommunicationInterface, err?: Error) => void;
  disconnected: (iface: ICommunicationInterface, err?: Error) => void;
  dataReceived: (iface: ICommunicationInterface, data: ArrayBuffer) => void;
  write: (iface: ICommunicationInterface, data: ArrayBuffer) => void;
  stringReceived: (iface: ICommunicationInterface, data: string) => void;
  error: (iface: ICommunicationInterface, err: Error) => void;
}

export abstract class CommunicationInterface extends TypedEmitter<Events> implements ICommunicationInterface {

  private fName: string = uuid();
  private fConnectTimeout = 3000;
  private fConnectTimeoutTimerId?: NodeJS.Timeout;
  private fIsConnecting = false;
  private fIsDisconnecting = false;
  protected fReadQueue?: Denque<ReadQueueItem> = undefined;
  protected fOptions?: CommunicationInterfaceConfigurationOptions = undefined;

  async setDeviceAddress(address: number): Promise<void> {
    // GPIB
    await Promise.resolve();
  }

  get name() { return this.fName; }
  set name(value: string) { this.fName = value; }

  get connectTimeout() { return this.fConnectTimeout; }
  set connectTimeout(value: number) {
    if (value < 0) throw new Error('connectTimout cannot be less than zero');
    if (value === this.fConnectTimeout) return;
    this.fConnectTimeout = value;
  }

  get isConnecting() { return this.fIsConnecting; }
  get isDisconnecting() { return this.fIsDisconnecting; }
  abstract get isConnected(): boolean;

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
    if (this.fReadQueue) {
      for (let index = 0; index < this.fReadQueue.length; index++) {
        const handler = this.fReadQueue.get(index);
        if (handler && handler.cancelCallback) handler.cancelCallback();
      }
      this.fReadQueue.clear();
      this.fReadQueue = undefined;
    }
    await this.onDisconnected();
  }

  protected onConnecting(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fIsConnecting = true;
      this.fIsDisconnecting = false;
      this.emit('connecting', this);
      this.fConnectTimeoutTimerId = setTimeout(async () => {
        await this.disconnect();
        return reject(new Error(`${this.name} failed to connect within ${this.connectTimeout} ms`));
      }, this.connectTimeout);
      return resolve();
    });
  }

  protected async onConnected(): Promise<void> {
    if (this.fConnectTimeoutTimerId) clearTimeout(this.fConnectTimeoutTimerId);
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

  private enqueue(readHandler: ReadQueueItem) {
    if (!this.fReadQueue) this.fReadQueue = new Denque<ReadQueueItem>();
    const handlerQueueIndex = this.fReadQueue.push(readHandler);
    readHandler.cancelCallback = () => {
      log.debug('enqueue::readHandler.cancelCallback called');
      if (this.fReadQueue) this.fReadQueue.removeOne(handlerQueueIndex);
      (readHandler as any).callback = undefined;
    }
  }

  async writeData(data: ArrayBuffer, readHandler?: ReadQueueItem) {
    if (readHandler) this.enqueue(readHandler);
    this.emit('write', this, data);
    await this.write(data);
  }

  protected abstract write(data: ArrayBuffer): Promise<void>;

  protected onData(data: ArrayBuffer) {
    if (this.fReadQueue && !this.fReadQueue.isEmpty()) {
      const handler = this.fReadQueue.shift();
      if (handler) handler.callback(data);
    } else if (this.fReadQueue && this.fReadQueue.isEmpty()) {
      throw 'Received data without a handler in the queue: ' + data;
    }
    this.emit('dataReceived', this, data);
  }

  async writeInt8(data: number, readHandler?: ReadQueueItem): Promise<void> {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer, 0, buffer.byteLength);
    view.setInt8(0, data);
    await this.writeData(buffer, readHandler);
  }

  async writeUInt8(data: number, readHandler?: ReadQueueItem): Promise<void> {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer, 0, buffer.byteLength);
    view.setUint8(0, data);
    await this.writeData(buffer, readHandler);
  }

  async writeInt16(data: number, readHandler?: ReadQueueItem): Promise<void> {
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer, 0, buffer.byteLength);
    view.setInt16(0, data);
    await this.writeData(buffer, readHandler);
  }

  async writeUInt16(data: number, readHandler?: ReadQueueItem): Promise<void> {
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer, 0, buffer.byteLength);
    view.setUint16(0, data);
    await this.writeData(buffer, readHandler);
  }

  async writeInt32(data: number, readHandler?: ReadQueueItem): Promise<void> {
    const buffer = new ArrayBuffer(32);
    const view = new DataView(buffer, 0, buffer.byteLength);
    view.setInt32(0, data);
    await this.writeData(buffer, readHandler);
  }

  async writeUInt32(data: number, readHandler?: ReadQueueItem): Promise<void> {
    const buffer = new ArrayBuffer(32);
    const view = new DataView(buffer, 0, buffer.byteLength);
    view.setUint32(0, data);
    await this.writeData(buffer, readHandler);
  }

  async writeInt64(data: bigint, readHandler?: ReadQueueItem): Promise<void> {
    const buffer = new ArrayBuffer(64);
    const view = new DataView(buffer, 0, buffer.byteLength);
    view.setBigInt64(0, data);
    await this.writeData(buffer, readHandler);
  }

  async writeUInt64(data: bigint, readHandler?: ReadQueueItem): Promise<void> {
    const buffer = new ArrayBuffer(64);
    const view = new DataView(buffer, 0, buffer.byteLength);
    view.setBigUint64(0, data);
    await this.writeData(buffer, readHandler);
  }

  async writeFloat32(data: number, readHandler?: ReadQueueItem): Promise<void> {
    const buffer = new ArrayBuffer(64);
    const view = new DataView(buffer, 0, buffer.byteLength);
    view.setFloat32(0, data);
    await this.writeData(buffer, readHandler);
  }

  async writeFloat64(data: number, readHandler?: ReadQueueItem): Promise<void> {
    const buffer = new ArrayBuffer(64);
    const view = new DataView(buffer, 0, buffer.byteLength);
    view.setFloat64(0, data);
    await this.writeData(buffer, readHandler);
  }

  async writeString(data: string, encoding: BufferEncoding = 'utf-8', readHandler?: ReadQueueItem): Promise<void> {
    const buffer = Buffer.from(data, encoding);
    await this.writeData(buffer, readHandler);
  }

  async queryString(data: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
    return new Promise(async (resolve, reject) => {
        const handler = (data: ArrayBuffer) => {
          const dataString = new TextDecoder().decode(data);
          this.emit('stringReceived', this, dataString);
          return resolve(dataString);
        };
        const response: ReadQueueItem = {
          callback: handler
        };
        await this.writeString(data, encoding, response)
        //.then(() => resolve())
        .catch(error => {
          this.onError(error);
          return reject(error);
        });
      });
  }

}
