import type { NodeProperties } from 'node-red';

export interface NodeRedNodeUIProperties {
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

export interface NodeRedNodesEachConfigCallback {
  (node: NodeProperties): void;
}

export interface NodeRedNodes {
  eachConfig(callback: NodeRedNodesEachConfigCallback): void;
  registerType<T extends NodeRedNodeUIProperties>(type: string, constructor: T, opts?: any): void;
}

export interface NodeRedEditorClient {
  nodes: NodeRedNodes;
}
