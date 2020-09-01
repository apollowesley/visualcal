import { NodeRed } from '../../@types/logic-server';
import { IndySoftNodeTypeNames } from '../../constants';
import { RuntimeNode, RuntimeProperties } from './types';

module.exports = (RED: NodeRed) => {
  function nodeConstructor(this: RuntimeNode, config: RuntimeProperties) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.shortName = config.shortName;
  }
  RED.nodes.registerType(IndySoftNodeTypeNames.Procedure, nodeConstructor);
};
