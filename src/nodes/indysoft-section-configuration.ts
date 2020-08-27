import { NodeRed } from '../@types/logic-server';
import { IndySoftNodeTypeNames } from '../constants';
import { RuntimeNode, RuntimeProperties } from './indysoft-section-configuration-types';

module.exports = (RED: NodeRed) => {
  function nodeConstructor(this: RuntimeNode, config: RuntimeProperties) {
    RED.nodes.createNode(this, config);
    this.shortName = config.shortName;
  }
  RED.nodes.registerType(IndySoftNodeTypeNames.SectionConfiguration, nodeConstructor);
};
