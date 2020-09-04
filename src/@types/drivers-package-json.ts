interface DriversPackageJsonInterface {
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

interface DriversPackageJsonVisualCalDrivers {
  interfaces: DriversPackageJsonInterface[];
  devices: DriversPackageJsonDriver[];
}

interface DriversPackageJsonVisualCal {
  drivers: DriversPackageJsonVisualCalDrivers;
}

export interface DriversPackageJson {
  visualcal: DriversPackageJsonVisualCal;
}
