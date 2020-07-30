import { NodeRed, ActionStartRuntimeNode, ActionStartRuntimeProperties, SectionRuntimeNode, NodeResetOptions } from '../@types/logic-server';
import { IndySoftNodeTypeNames } from '../@types/constants';
import { TriggerOptions } from '../main/node-red/utils/actions';

module.exports = (RED: NodeRed) => {

  function nodeConstructor(this: ActionStartRuntimeNode, config: ActionStartRuntimeProperties) {
    RED.nodes.createNode(this, config);
    this.section = RED.nodes.getNode(config.sectionConfigId) as SectionRuntimeNode;
    this.name = config.name;
    this.isRunning = false;
    const resetStatus = () => {
      this.isRunning = false;
      this.status({});
    };
    this.on('start', (options: TriggerOptions) => {
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
      this.sessionId = options.sessionId;
      this.runId = options.runId;
      this.send({
        payload: {
          sessionId: options.sessionId,
          runId: options.runId,
          section: this.section.shortName,
          action: this.name
        }
      });
      global.visualCal.actionManager.stateChanged(this, 'started');
    });
    this.on('stop', () => {
      if (!this.section || !this.sessionId || !this.runId) {
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
