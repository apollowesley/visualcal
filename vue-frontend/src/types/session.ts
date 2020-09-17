import { BenchConfig } from './bench-config';

interface Person {
  nameFirst: string;
  nameLast: string;
  email?: string;
}

export interface User extends Person {
  email: string;
  sessions: Session[];
  benchConfigs: BenchConfig[];
  token?: string;
  bio?: string;
  image?: string;
  roles?: string[];
}


export interface DeviceDriverInfo {
  manufacturer: string;
  deviceModel: string;
  categories: string[];
}

export interface GpibDeviceConfiguration {
  address: number;
}

export interface CommunicationInterfaceDeviceNodeConfiguration {
  configNodeId: string;
  unitId: string;
  interfaceName: string;
  gpib?: GpibDeviceConfiguration;
  driverDisplayName: string;
  isGeneric?: boolean;
  driver?: DeviceDriverInfo;
}

export interface CommunicationConfiguration {
  benchConfigName?: string;
  devices: CommunicationInterfaceDeviceNodeConfiguration[];
}


export interface Session {
  name: string;
  username: string;
  procedureName: string;
  lastSectionName?: string;
  lastActionName?: string;
  configuration?: CommunicationConfiguration;
}

interface ProcedureSection {
  name: string;
  order?: number;
  description: string;
  icon?: string;
  guiEditor: 'tms' | 'grapesjs' | 'indysoft' | 'linear';
  isCompleted: boolean;
  isRunning: boolean;
}

interface Procedure {
  name: string;
  version: string;
  description: string;
  authorOrganization: string;
  authors: Person[];
  sections: ProcedureSection[];
}

interface ActionInfo {
  name: string;
}

interface SectionInfo {
  name: string;
  shortName: string;
  actions: ActionInfo[];
}

export interface DriversPackageJsonDriver {
  displayName: string;
  class: string;
  manufacturer: string;
  model: string;
  categories: string[];
  path: string;
}

interface DeviceNodeDriverRequirementsInfo {
  configNodeId: string;
  unitId: string;
  driverCategories?: string[]; // Only found on generic device nodes
  availableDrivers: DriversPackageJsonDriver[];
  isGeneric?: boolean;
}

export interface ViewInfo {
  user: User;
  benchConfig?: BenchConfig;
  session: Session,
  procedure: Procedure;
  sections: SectionInfo[];
  deviceNodes: DeviceNodeDriverRequirementsInfo[];
}
