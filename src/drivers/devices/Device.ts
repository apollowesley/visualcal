import { EventEmitter } from 'events';
import { DeviceDefinition, DeviceInfo } from './device-interfaces';

export abstract class Device extends EventEmitter {

  protected deviceDefinition: DeviceDefinition;

  protected constructor(definition: DeviceDefinition) {
    super();
    this.deviceDefinition = definition;
  }

  public get info(): DeviceInfo { return this.deviceDefinition.info; }

}
