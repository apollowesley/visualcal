import { NodeProperties } from 'node-red';
import { NodeRedRuntimeNode, NodeRed, NodeRedNodeMessage, NodeRedNodeSendFunction, NodeRedNodeDoneFunction } from '../@types/logic-server';

const NODE_TYPE = 'indysoft-testpoint';

type RuntimeProperties = NodeProperties

type RuntimeNode = NodeRedRuntimeNode

module.exports = function(RED: NodeRed) {
  function nodeConstructor(this: RuntimeNode, config: RuntimeProperties) {
    RED.nodes.createNode(this, config);
    this.on('input', (msg: NodeRedNodeMessage, send: NodeRedNodeSendFunction, done?: NodeRedNodeDoneFunction) => {
      send(msg);
      if (done) done();
    });
  }
  RED.nodes.registerType(NODE_TYPE, nodeConstructor);
};
