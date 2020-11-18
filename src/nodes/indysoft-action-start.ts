import { NodeRed, NodeRedRuntimeNode } from '../@types/logic-server';
import { IndySoftNodeTypeNames } from '../constants';
import { RuntimeNode } from './indysoft-action-start-types';
import electronLog from 'electron-log';

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

module.exports = function(RED: NodeRed) {
  function indySoftActionStartNodeConstructor(this: RuntimeNode, config: NodeRedNodeUIProperties) {
    RED.nodes.createNode(this, config as any);
    const log = electronLog.scope(`${IndySoftNodeTypeNames.ActionStart} | id=${this.id}`);
    if (config.sectionConfigId) this.section = RED.nodes.getNode(config.sectionConfigId) as NodeRedRuntimeNode;
    if (config.name) this.name = config.name;
    this.isRunning = false;
    const resetStatus = () => {
      this.isRunning = false;
      this.status({
        fill: 'grey',
        shape: 'dot',
        text: 'Ready'
      });
    };
    this.start = (runId?: string) => {
      return new Promise<void>((resolve, reject) => {
        log.info('Starting');
        if (!this.section) {
          this.error('Missing secton configuration');
          return reject();
        }
        if (this.isRunning) {
          this.error('Already running');
          return reject();
        }
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
        return resolve();
      });
    };
    this.stop = () => {
      return new Promise<void>((resolve) => {
        resetStatus();
        return resolve();
      });
    };
    this.reset = () => {
      return new Promise<void>((resolve) => {
        resetStatus();
        return resolve();
      })
    }
  }
  RED.nodes.registerType(IndySoftNodeTypeNames.ActionStart, indySoftActionStartNodeConstructor as any);
};
