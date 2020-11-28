import { DeviceConfigurationProperties } from '../@types/logic-nodes';
import { DeviceConfigurationNode } from '../@types/logic-server';

export const TypeName = 'indysoft-instrument-driver-configuration';

export interface ConfigurationNode extends DeviceConfigurationNode {
  manufacturer: string;
  model: string;
  useCategories?: boolean;
}

export interface ConfigurationProperties extends DeviceConfigurationProperties {
  manufacturer: string;
  model: string;
  useCategories?: boolean;
}
