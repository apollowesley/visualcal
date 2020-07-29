import { EventEmitter } from 'events';
import { DeviceDefinition, DeviceInfo } from './device-interfaces';
import { v4 as uuid, v4 } from 'uuid';

export abstract class Device extends EventEmitter {

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
