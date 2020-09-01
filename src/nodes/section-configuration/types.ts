import { NodeRedNodeUIProperties, NodeRedRuntimeNode } from '../../@types/logic-server';
import { NodeRedFlowNode } from '../../@types/node-red-info';

export interface EditorNode extends NodeRedFlowNode {
  shortName: string;
}

export interface RuntimeNode extends NodeRedRuntimeNode {
  shortName: string;
}

export interface RuntimeProperties extends NodeRedNodeUIProperties {
  shortName: string;
}
