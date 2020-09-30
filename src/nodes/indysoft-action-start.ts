import { NodeRed, NodeResetOptions } from '../@types/logic-server';
import { IndySoftNodeTypeNames } from '../constants';
import { RuntimeNode, TriggerOptions } from './indysoft-action-start-types';
import { RuntimeNode as IndySoftSectionConfigurationRuntimeNode } from './indysoft-section-configuration-types';
import RED from 'node-red';
import VisualCalNodeRed from '../main/node-red';

const nodeRed = RED as NodeRed;
const visualCalNodeRed = VisualCalNodeRed();

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

function indySoftActionStartNodeConstructor(this: RuntimeNode, config: NodeRedNodeUIProperties) {
  nodeRed.nodes.createNode(this, config as any);
  if (config.sectionConfigId) this.section = nodeRed.nodes.getNode(config.sectionConfigId) as IndySoftSectionConfigurationRuntimeNode;
  if (config.name) this.name = config.name;
  this.isRunning = false;
  const resetStatus = () => {
    this.isRunning = false;
    this.status({});
  };
  this.on('start', (runId?: string) => {
    if (!this.section) {
      this.error('Missing secton configuration');
      return;
    }
    if (this.isRunning) {
      this.error('Already running');
      return;
    }
    visualCalNodeRed.resetConnectedNodes(this);
    this.status({
      fill: 'green',
      shape: 'dot',
      text: 'Running'
    });
    this.isRunning = true;
    this.send({
      payload: {
        section: this.section.shortName,
        action: this.name,
        runId: runId
      }
    });
    global.visualCal.actionManager.stateChanged(this, 'started');
  });
  this.on('stop', (opts?: TriggerOptions) => {
    if (!this.section) {
      this.error('Missing secton configuration');
      return;
    }
    resetStatus();
    visualCalNodeRed.resetConnectedInstructionNodes(this);
    global.visualCal.actionManager.stateChanged(this, 'stopped', opts);
  });
  this.on('reset', (options?: NodeResetOptions) => {
    resetStatus();
    visualCalNodeRed.resetConnectedNodes(this, options);
  });
}

module.exports = (RED: NodeRed) => {
  RED.nodes.registerType(IndySoftNodeTypeNames.ActionStart, indySoftActionStartNodeConstructor as any);
};
