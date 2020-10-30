import { NodeRed, NodeRedRuntimeNode, NodeRedNodeUIProperties } from '../@types/logic-server';
import { IndySoftNodeTypeNames } from '../constants';

module.exports = (RED: NodeRed) => {
  function nodeConstructor(this: NodeRedRuntimeNode, config: NodeRedNodeUIProperties) {
    RED.nodes.createNode(this, config);
  }
  RED.nodes.registerType(IndySoftNodeTypeNames.SectionConfiguration, nodeConstructor);
};
