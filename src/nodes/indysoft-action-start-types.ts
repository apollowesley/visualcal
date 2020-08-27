import { NodeRedNodeUIProperties, NodeRedRuntimeNode } from '../@types/logic-server';
import { NodeRedFlowNode } from '../@types/node-red-info';
import { RuntimeNode as IndySoftSectionConfigurationRuntimeNode } from './indysoft-section-configuration-types';

export interface EditorNode extends NodeRedFlowNode {
  sectionConfigId: string;
}

export interface RuntimeNode extends NodeRedRuntimeNode {
  sessionId?: string;
  runId?: string;
  section?: IndySoftSectionConfigurationRuntimeNode;
  isRunning: boolean;
}

export interface RuntimeProperties extends NodeRedNodeUIProperties {
  sectionConfigId: string;
}
