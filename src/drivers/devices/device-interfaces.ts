type deviceClass = 'generic' | 'digital-multi-meter' | 'oscilloscope' | 'multi-product-calibrator';

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
