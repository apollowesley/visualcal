import { NodeProperties } from 'node-red';
import type { NodeRedRuntimeNode, VisualCalNodeRedNodeInputMessage, NodeRedNodeSendFunction, NodeRedNodeDoneFunction, NodeResetOptions, NodeRed } from '../../@types/logic-server';

module.exports = (RED: NodeRed) => {
  console.info('indysoft-action-completed main export function called.');
  function nodeConstructor(this: NodeRedRuntimeNode, config: NodeProperties) {
    console.info('indysoft-action-completed node constructor called.');
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
      const startNode = global.visualCal.nodeRed.visualCal.visualCalActionStartNodes.find(n => n.runtime.section && msg.payload && n.runtime.section.shortName === msg.payload.section && n.runtime.name === msg.payload.action);
      if (!startNode) {
        this.error('Unable to locate start node');
        if (done) done();
        return;
      }
      startNode.runtime.emit('stop');
      global.visualCal.nodeRed.visualCal.resetVisualCalActionStartNode(msg.payload.section, msg.payload.action);
      global.visualCal.actionManager.stateChanged(startNode.runtime, 'completed');
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
  RED.nodes.registerType('{{ nodeType }}', nodeConstructor);
};
