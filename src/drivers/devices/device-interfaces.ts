type deviceClass = 'generic' | 'digital-multi-meter' | 'oscilloscope' | 'multi-product-calibrator';

interface DeviceCommand {
  type: 'read' | 'write' | 'query';
  command: string | ArrayBuffer;
}

interface DeviceReadCommand extends DeviceCommand {
  type: 'read';
  readTag: string;
}

class DeviceCommandSet {

  private fCommands: DeviceCommand[];

  constructor() {
    this.fCommands = [];
  }

  get commands(): DeviceCommand[] { return this.fCommands; }

}

export interface DeviceInfo {
  manufacturer: string;
  model: string;
  nomenclature: string;
}

export interface DeviceDefinition {
  info: DeviceInfo;
  classes: deviceClass[];
  commands: Record<string, unknown>;
}
