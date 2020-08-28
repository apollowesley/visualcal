import { NodeRed, NodeResetOptions } from '../@types/logic-server';
import { IndySoftNodeTypeNames } from '../constants';
import { RuntimeNode, RuntimeProperties } from './indysoft-action-start-types';
import { RuntimeNode as IndySoftSectionConfigurationRuntimeNode } from './indysoft-section-configuration-types';
import VisualCalNodeRed from '../main/node-red';

const visualCalNodeRed = VisualCalNodeRed();

module.exports = (RED: NodeRed) => {

  function nodeConstructor(this: RuntimeNode, config: RuntimeProperties) {
    RED.nodes.createNode(this, config);
    this.section = RED.nodes.getNode(config.sectionConfigId) as IndySoftSectionConfigurationRuntimeNode;
    this.name = config.name;
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

  RED.nodes.registerType(IndySoftNodeTypeNames.ActionStart, nodeConstructor);
};
