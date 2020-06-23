export interface DriverInfo {
  manufacturer: string;
  model: string;
  nomenclature: string;
}

export interface Drivers {
  getNomenclatures(): string[];
  getDriverInfos(nomenclature: string): DriverInfo[];
  // eslint-disable-next-line
  find(info: DriverInfo): any;
}
