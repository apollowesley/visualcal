export interface DeviceIdentity {
  manufacturer: string;
  model: string;
  serialNumber?: string;
  // eslint-disable-next-line
  options?: any[];
}

export interface Identifiable {
  getIdentity(): Promise<DeviceIdentity>;
}
