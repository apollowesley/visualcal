import { DeviceDefinition, DeviceInfo } from './device-interfaces';
import { v4 as uuid } from 'uuid';
import { TypedEmitter } from 'tiny-typed-emitter';
import { CommunicationInterface } from '../communication-interfaces/CommunicationInterface';
import electronLog from 'electron-log';

const log = electronLog.scope('Device');

interface Events {
  dataReceived: (iface: ICommunicationInterface, data: ArrayBuffer) => void;
  write: (iface: ICommunicationInterface, data: ArrayBuffer) => void;
  writeString: (device: Device, iface: ICommunicationInterface, data: string) => void;
  writeCancelled: (device: Device, iface: ICommunicationInterface, data: string) => void;
  stringReceived: (iface: ICommunicationInterface, data: string) => void;
  error: (iface: ICommunicationInterface, err: Error) => void;
}

export interface BeforeWriteStringResult {
  cancel?: boolean;
  data: string;
}

export abstract class Device extends TypedEmitter<Events> {

  private fName: string = uuid();
  protected deviceDefinition: DeviceDefinition;
  private fCommunicationInterface?: CommunicationInterface = undefined;

  protected constructor(definition: DeviceDefinition) {
    super();
    this.deviceDefinition = definition;
    log.info(`Device, ${this.name}, created`);
  }

  get name() { return this.fName; }
  set name(value: string) {
    if (this.fName === value) return;
    const oldName = this.fName;
    this.fName = value;
    log.info(`Device named changed from "${oldName}" to "${value}"`);
  }

  public get info(): DeviceInfo { return this.deviceDefinition.info; }

  get communicationInterface() { return this.fCommunicationInterface; }

  setCommunicationInterface(communicationInterface: ICommunicationInterface) {
    this.fCommunicationInterface = communicationInterface as CommunicationInterface;
  }

  private async write(data: ArrayBuffer | string, readHandler?: ReadQueueItem) {
    if (!this.fCommunicationInterface) throw new Error('Communication interface must be set');
    if (typeof data === 'object') {
      await this.fCommunicationInterface.writeData(data, readHandler);
      this.emit('write', this.fCommunicationInterface, data);
      return;
    }
    const dataArrayBuffer = new TextEncoder().encode(data);
    await this.fCommunicationInterface.writeData(dataArrayBuffer, readHandler);
    this.emit('write', this.fCommunicationInterface, dataArrayBuffer);
  }

  onBeforeWriteString?: (device: Device, iface: ICommunicationInterface, data: string) => Promise<BeforeWriteStringResult>;

  async writeString(data: string) {
    if (!this.fCommunicationInterface) throw new Error('Communication interface must be set');
    if (this.onBeforeWriteString) {
      const result = await this.onBeforeWriteString(this, this.fCommunicationInterface, data);
      if (result.cancel) {
        this.emit('writeCancelled', this, this.fCommunicationInterface, data);
        return;
      }
      data = result.data;
    }
    this.emit('writeString', this, this.fCommunicationInterface, data);
    await this.write(data);
  };

  queryString(data: ArrayBuffer | string) {
    return new Promise<string>(async (resolve, reject) => {
      const readHandler: ReadQueueItem = {
        callback: (data, cancelled) => {
          if (this.fCommunicationInterface) this.emit('dataReceived', this.fCommunicationInterface, data);
          if (cancelled) return reject();
          const dataString = new TextDecoder().decode(data);
          if (this.fCommunicationInterface) this.emit('stringReceived', this.fCommunicationInterface, dataString);
          return resolve(dataString);
        },
        cancelCallback: () => {
          return reject();
        }
      };
      let writeDataString = typeof data === 'string' ? data : new TextDecoder().decode(data);
      if (this.onBeforeWriteString) {
        if (!this.fCommunicationInterface) throw new Error('Communication interface must be set');
        const result = await this.onBeforeWriteString(this, this.fCommunicationInterface, writeDataString);
        if (result.cancel) {
          this.emit('writeCancelled', this, this.fCommunicationInterface, writeDataString);
          return;
        }
        writeDataString = result.data;
        data = new TextEncoder().encode(writeDataString);
      }
      await this.write(data, readHandler);
    });
  }

}
