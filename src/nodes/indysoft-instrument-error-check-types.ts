import { NodeRedRuntimeNode } from '../@types/logic-server';
import { NodeRedManager } from '../main/managers/NodeRedManager';
import { ConfigurationNode } from './indysoft-instrument-driver-configuration-types';

interface NodeRedNodeUIProperties {
  sectionConfigId?: string;
  name?: string;
  category: string;
  defaults: any;
  credentials?: any;
  inputs?: number;
  outputs?: number;
  color: string;
  paletteLabel?: string | any;
  label?: string | any;
  labelStyle?: string | any;
  inputLabels?: string[] | any;
  outputLabels?: string[] | any;
  icon?: string;
  align?: 'left' | 'right';
  button?: any;
  oneditprepare?: () => void;
  oneditsave?: () => void;
  oneditcancel?: () => void;
  oneditdelete?: () => void;
  oneditresize?: () => void;
  onpaletteadd?: () => void;
  onpaletteremove?: () => void;
}

export type CheckType = 'scpi' | 'gpib4882';

export interface CustomDriverNodeRedRuntimeNode extends NodeRedRuntimeNode {
  driverConfigId: string;
  checkType: CheckType;
}

export interface CustomDriverNodeUIProperties extends NodeRedNodeUIProperties {
  driverConfigId: string;
  checkType: CheckType;
}

export const findCustomDriverConfigRuntimeNode = (node: CustomDriverNodeRedRuntimeNode) => {
  const foundConfig = NodeRedManager.instance.nodes.find(n => n.id === node.driverConfigId);
  if (!foundConfig) return foundConfig;
  return foundConfig.runtime as ConfigurationNode;
}
