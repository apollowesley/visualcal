import { DeviceDefinition, DeviceInfo } from './device-interfaces';

export abstract class Device {

  protected deviceDefinition: DeviceDefinition;

  protected constructor(definition: DeviceDefinition) {
    this.deviceDefinition = definition;
  }

  public get info(): DeviceInfo { return this.deviceDefinition.info; }

}
