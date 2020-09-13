import Denque from 'denque';
import { v4 as uuid } from 'uuid';
import { TextDecoder } from 'util';
import { TypedEmitter } from 'tiny-typed-emitter';
import electronLog from 'electron-log';

const log = electronLog.scope('CommunicationInterface');

interface Events {
  connecting: (iface: ICommunicationInterface) => void;
  connected: (iface: ICommunicationInterface, err?: Error) => void;
  disconnected: (iface: ICommunicationInterface, err?: Error) => void;
  dataReceived: (iface: ICommunicationInterface, data: ArrayBuffer) => void;
  write: (iface: ICommunicationInterface, data: ArrayBuffer) => void;
  stringReceived: (iface: ICommunicationInterface, data: string) => void;
  error: (iface: ICommunicationInterface, err: Error) => void;
}

export abstract class CommunicationInterface extends TypedEmitter<Events> implements ICommunicationInterface {

  private fName: string = uuid();
  private isEnabled = false;
  protected fReadQueue?: Denque<ReadQueueItem> = undefined;
  protected fOptions?: CommunicationInterfaceConfigurationOptions = undefined;

  get name() { return this.fName; }
  set name(value: string) { this.fName = value; }

  async setDeviceAddress(address: number): Promise<void> {
    await Promise.resolve();
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
    this.disconnect();
  }

  abstract async connect(): Promise<void>;

  protected onConnecting() {
    this.emit('connecting', this);
  }

  protected async onConnected() {
    this.emit('connected', this);
    return await Promise.resolve();
  }

  abstract disconnect(): void;

  protected onDisconnected() {
    if (this.fReadQueue) {
      for (let index = 0; index < this.fReadQueue.length; index++) {
        const handler = this.fReadQueue.get(index);
        if (handler?.cancelCallback) handler.cancelCallback();
      }
      this.fReadQueue.clear();
      this.fReadQueue = undefined;
    }
    this.emit('disconnected', this);
  }

  abstract get isConnected(): boolean;

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
      try {
        this.disconnect();
        throw 'Cannot configure while connected';
      } catch (error) {
        if (error instanceof Error) this.onError(error);
        else this.onError(new Error(error));
      }
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
    // do not allow writes if we are disabled
    if (!this.isEnabled) return;
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
