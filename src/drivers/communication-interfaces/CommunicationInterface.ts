import Denque from 'denque';
import { EventEmitter } from 'events';
import { TextDecoder } from 'util';

export abstract class CommunicationInterface implements ICommunicationInterface {

  private isEnabled = false;
  protected fReadQueue?: Denque<ReadQueueItem> = undefined;
  protected fOptions?: CommunicationInterfaceConfigurationOptions = undefined;
  protected fEventEmitter = new EventEmitter();

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
    this.disconnect();
  }

  // eslint-disable-next-line
  on(event: CommunicationInterfaceEvents, listener: (...args: any[]) => void) {
    this.fEventEmitter.on(event, listener);
  }

  // eslint-disable-next-line
  off(event: CommunicationInterfaceEvents, listener: (...args: any[]) => void) {
    this.fEventEmitter.off(event, listener);
  }

  abstract async connect(): Promise<void>;

  addConnectedHandler(handler: ConnectedEventHandler) {
    this.fEventEmitter.on('connected', handler);
  }

  removeConnectedHandler(handler: ConnectedEventHandler) {
    this.fEventEmitter.off('connected', handler);
  }

  protected onConnected() {
    this.fEventEmitter.emit('connected');
  }

  abstract disconnect(): void;

  addDisconnectedHandler(handler: DisconnectedEventHandler) {
    this.fEventEmitter.on('disconnected', handler);
  }

  removeDisconnectedHandler(handler: DisconnectedEventHandler) {
    this.fEventEmitter.off('disconnected', handler);
  }

  protected onDisconnected() {
    if (this.fReadQueue) {
      this.fReadQueue.clear();
      this.fReadQueue = undefined;
    }
    this.fEventEmitter.emit('disconnected');
  }

  abstract get isConnected(): boolean;

  addErrorHandler(handler: ErrorEventHandler) {
    this.fEventEmitter.on('error', handler);
  }

  removeErrorHandler(handler: ErrorEventHandler) {
    this.fEventEmitter.off('error', handler);
  }

  protected onError(error: Error) {
    this.fEventEmitter.emit('error', error);
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
    this.fReadQueue.push(readHandler);
  }

  async writeData(data: ArrayBuffer, readHandler?: ReadQueueItem): Promise<void> {
    // do not allow writes if we are disabled
    if (!this.isEnabled) return;
    if (readHandler) this.enqueue(readHandler);
    this.fEventEmitter.emit('write', data);
    return this.write(data);
  }

  protected abstract async write(data: ArrayBuffer): Promise<void>;

  protected onData(data: ArrayBuffer) {
    if (this.fReadQueue && !this.fReadQueue.isEmpty()) {
      const handler = this.fReadQueue.shift();
      if (handler) handler.callback(data);
    } else if (this.fReadQueue && this.fReadQueue.isEmpty()) {
      throw 'Received data without a handler in the queue: ' + data;
    }
    this.fEventEmitter.emit('data', data);
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
    return new Promise((resolve, reject) => {
        const handler = (data: ArrayBuffer) => {
          console.debug('Communication interface received data');
          if (data) console.debug(`Received data length: ${data.byteLength}`);
          return resolve(new TextDecoder().decode(data));
        };
        const response: ReadQueueItem = {
          callback: handler
        };
        this.writeString(data, encoding, response)
        //.then(() => resolve())
        .catch(error => {
          this.onError(error);
          return reject(error);
        });
      });
  }

}
