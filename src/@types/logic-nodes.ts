import { NodeRedFlowNode } from './node-red-info';

export interface DeviceConfigurationProperties extends NodeRedFlowNode {
  unitId: string;
}

export interface DeviceNodeProperties extends NodeRedFlowNode {
  deviceConfigId: string;
}
