import { NodeRed, NodeResetOptions } from '../../@types/logic-server';
import { IndySoftNodeTypeNames } from '../../constants';
import { RuntimeNode } from './types';
import { RuntimeNode as IndySoftSectionConfigurationRuntimeNode } from '../section-configuration/types';

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

module.exports = (RED: NodeRed) => {
  function nodeConstructor(this: RuntimeNode, config: NodeRedNodeUIProperties) {
    RED.nodes.createNode(this, config as any);
    if (config.sectionConfigId) this.section = RED.nodes.getNode(config.sectionConfigId) as IndySoftSectionConfigurationRuntimeNode;
    if (config.name) this.name = config.name;
    this.isRunning = false;
    const resetStatus = () => {
      this.isRunning = false;
      this.status({});
    };
    this.on('start', () => {
      if (!this.section) {
        this.error('Missing secton configuration');
        return;
      }
      if (this.isRunning) {
        this.error('Already running');
        return;
      }
      RED.settings.resetAllConnectedNodes(this);
      global.visualCal.communicationInterfaceManager.enableAll();
      this.status({
        fill: 'green',
        shape: 'dot',
        text: 'Running'
      });
      this.isRunning = true;
      this.send({
        payload: {
          section: this.section.shortName,
          action: this.name
        }
      });
      global.visualCal.actionManager.stateChanged(this, 'started');
    });
    this.on('stop', () => {
      if (!this.section) {
        this.error('Missing secton configuration');
        return;
      }
      resetStatus();
      global.visualCal.communicationInterfaceManager.disableAll();
      RED.settings.resetAllConnectedInstructionNodes(this);
      global.visualCal.actionManager.stateChanged(this, 'stopped');
    });
    this.on('reset', (options?: NodeResetOptions) => {
      resetStatus();
      RED.settings.resetAllConnectedNodes(this, options);
    });
  }
  RED.nodes.registerType(IndySoftNodeTypeNames.ActionStart, nodeConstructor as any);
};
