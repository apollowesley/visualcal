import { NodeProperties } from 'node-red';

export interface NodeRedFlowNode extends NodeProperties {
  disabled: boolean;
  info: string;
  label?: string;
  x?: number;
  y?: number;
  z?: string;
  wires?: string[][];
  links?: string[];
}

export interface NodeRedFlow {
  flows: NodeRedFlowNode[];
  rev: string;
}
