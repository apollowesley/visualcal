export class DeviceManager {

  private fConfig: CommunicationConfiguration;

  constructor(initialConfig: CommunicationConfiguration) {
    this.fConfig = initialConfig;
  }

  get config() { return this.fConfig; }

  getDeviceConfig(unitId: string) {
    return this.fConfig.devices.find(d => d.unitId === unitId);
  }

}
