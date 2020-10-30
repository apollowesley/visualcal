import { NodeRed, NodeRedRuntimeNode, NodeResetOptions } from '../@types/logic-server';
import { IndySoftNodeTypeNames } from '../constants';
import { RuntimeNode } from './indysoft-action-start-types';
import RED from 'node-red';
import { NodeRedManager } from '../main/managers/NodeRedManager';

const nodeRed = RED as NodeRed;

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
  if (config.sectionConfigId) this.section = nodeRed.nodes.getNode(config.sectionConfigId) as NodeRedRuntimeNode;
  if (config.name) this.name = config.name;
  this.isRunning = false;
  const resetStatus = () => {
    this.isRunning = false;
    this.status({});
  };
  this.start = (runId?: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!this.section) {
        this.error('Missing secton configuration');
        return reject();
      }
      if (this.isRunning) {
        this.error('Already running');
        return reject();
      }
      NodeRedManager.instance.resetConnectedNodes(this);
      this.status({
        fill: 'green',
        shape: 'dot',
        text: 'Running'
      });
      this.isRunning = true;
      this.send({
        payload: {
          section: this.section.name,
          action: this.name,
          runId: runId
        }
      });
      global.visualCal.actionManager.stateChanged(this, 'started');
      return resolve();
    });
  };
  this.stop = () => {
    return new Promise<void>((resolve) => {
      resetStatus();
      NodeRedManager.instance.resetConnectedInstructionNodes(this);
      global.visualCal.actionManager.stateChanged(this, 'stopped');
      return resolve();
    });
  };
  this.reset = (options?: NodeResetOptions) => {
    return new Promise<void>((resolve) => {
      resetStatus();
      NodeRedManager.instance.resetConnectedNodes(this, options);
      return resolve();
    });
  };
}

module.exports = (RED: NodeRed) => {
  RED.nodes.registerType(IndySoftNodeTypeNames.ActionStart, indySoftActionStartNodeConstructor as any);
};
