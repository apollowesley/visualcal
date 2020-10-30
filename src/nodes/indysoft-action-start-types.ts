import { NodeRedNodeUIProperties, NodeRedRuntimeNode } from '../@types/logic-server';
import { NodeRedFlowNode } from '../@types/node-red-info';

export interface EditorNode extends NodeRedFlowNode {
  sectionConfigId: string;
}

export interface RuntimeNode extends NodeRedRuntimeNode {
  section?: NodeRedRuntimeNode;
  isRunning: boolean;
  start: (runId?: string) => Promise<void>;
  stop: () => Promise<void>;
  reset: () => Promise<void>;
}

export interface RuntimeProperties extends NodeRedNodeUIProperties {
  sectionConfigId: string;
}

export type TriggerType = 'start' | 'stop' | 'reset';

export interface ResetOptions {
  section: string;
  action: string;
}

export interface ResetResult extends ResetOptions {
  error?: string;
  message?: string;
}

export interface TriggerOptions {
  section: string;
  action: string;
  runId: string;
}
