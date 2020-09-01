import { NodeProperties } from 'node-red';
import { NodeRedRuntimeNode, NodeRed, NodeRedNodeMessage, NodeRedNodeSendFunction, NodeRedNodeDoneFunction } from '../@types/logic-server';

export const NODE_TYPE = 'indysoft-testpoint';

export type RuntimeProperties = NodeProperties

export type RuntimeNode = NodeRedRuntimeNode

module.exports = (RED: NodeRed) => {
  function nodeConstructor(this: RuntimeNode, config: RuntimeProperties) {
    RED.nodes.createNode(this, config);
    this.on('input', (msg: NodeRedNodeMessage, send: NodeRedNodeSendFunction, done?: NodeRedNodeDoneFunction) => {
      send(msg);
      if (done) done();
    });
  }
  RED.nodes.registerType(NODE_TYPE, nodeConstructor);
};
