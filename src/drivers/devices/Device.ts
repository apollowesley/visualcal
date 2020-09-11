import { EventEmitter } from 'events';
import { DeviceDefinition, DeviceInfo } from './device-interfaces';
import { v4 as uuid } from 'uuid';
import { TypedEmitter } from 'tiny-typed-emitter';

interface Events {
  dataReceived: (iface: ICommunicationInterface, data: ArrayBuffer) => void;
  write: (iface: ICommunicationInterface, data: ArrayBuffer) => void;
  stringReceived: (iface: ICommunicationInterface, data: string) => void;
  error: (iface: ICommunicationInterface, err: Error) => void;
}

export abstract class Device extends TypedEmitter<Events> {

  private static fDevices: Device[] = [];
  static get devices() { return this.fDevices; }

  private fName: string = uuid();
  protected deviceDefinition: DeviceDefinition;

  protected constructor(definition: DeviceDefinition) {
    super();
    this.deviceDefinition = definition;
    if (!Device.fDevices.find(d => d.name === this.name)) Device.fDevices.push(this);
  }

  get name() { return this.fName; }
  set name(value: string) { this.fName = value; }

  public get info(): DeviceInfo { return this.deviceDefinition.info; }

}
