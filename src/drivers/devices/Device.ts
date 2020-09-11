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

  private fName: string = uuid();
  protected deviceDefinition: DeviceDefinition;

  protected constructor(definition: DeviceDefinition) {
    super();
    this.deviceDefinition = definition;
  }

  get name() { return this.fName; }
  set name(value: string) { this.fName = value; }

  public get info(): DeviceInfo { return this.deviceDefinition.info; }

}
