import { NodeProperties } from 'node-red';
import { resetProcedureActionStatus } from './utils';
import type { NodeRedRuntimeNode, VisualCalNodeRedNodeInputMessage, NodeRedNodeSendFunction, NodeRedNodeDoneFunction, ActionStartRuntimeNode, NodeResetOptions, NodeRed } from '../@types/logic-server';

export const NODE_TYPE = 'indysoft-action-completed';

module.exports = (RED: NodeRed) => {
  function nodeConstructor(this: NodeRedRuntimeNode, config: NodeProperties) {
    RED.nodes.createNode(this, config);
    const reset = () => {
      this.status({});
    };
    this.on('input', (msg: VisualCalNodeRedNodeInputMessage, _send: NodeRedNodeSendFunction, done?: NodeRedNodeDoneFunction) => {
      if (!msg.payload || !msg.payload.sessionId || !msg.payload.runId || !msg.payload.section || !msg.payload.action) {
        this.error('Message missing payload', msg);
        if (done) done();
        return;
      }
      this.name = config.name;
      // Notify our start action node that we've completed
      const startNode = (RED.settings.findNodesByType('indysoft-action-start') as ActionStartRuntimeNode[]).find(n => n.section && msg.payload && n.section.shortName === msg.payload.section && n.name === msg.payload.action);
      if (!startNode) {
        this.error('Unable to locate start node');
        if (done) done();
        return;
      }
      startNode.emit('stop');
      resetProcedureActionStatus(this);
      global.visualCal.actionManager.stateChanged(startNode, 'completed');
      this.status({
        fill: 'blue',
        shape: 'dot',
        text: `Last run ${new Date().toString()}`
      });
      if (done) done();
    });
    this.on('reset', (options?: NodeResetOptions) => {
      if (options && options.targetId !== this.id) return;
      reset();
    });
  }
  RED.nodes.registerType(NODE_TYPE, nodeConstructor);
};
