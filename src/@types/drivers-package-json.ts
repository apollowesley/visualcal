export interface DriversPackageJsonInterface {
  displayName: string;
  class: string;
  path: string;
}

export interface DriversPackageJsonDriver {
  displayName: string;
  class: string;
  manufacturer: string;
  model: string;
  categories: string[];
  path: string;
}

export interface DriversPackageJsonVisualCalDrivers {
  interfaces: DriversPackageJsonInterface[];
  devices: DriversPackageJsonDriver[];
}

export interface DriversPackageJsonVisualCal {
  drivers: DriversPackageJsonVisualCalDrivers;
}

export interface DriversPackageJson {
  visualcal: DriversPackageJsonVisualCal;
}
