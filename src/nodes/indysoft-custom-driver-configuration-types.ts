import { DeviceConfigurationProperties } from '../@types/logic-nodes';
import { DeviceConfigurationNode } from '../@types/logic-server';

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
