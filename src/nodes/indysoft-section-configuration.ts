import { NodeRed, SectionRuntimeNode, SectionRuntimeProperties } from '../@types/logic-server';
import { IndySoftNodeTypeNames } from '../constants';

module.exports = (RED: NodeRed) => {
  function nodeConstructor(this: SectionRuntimeNode, config: SectionRuntimeProperties) {
    RED.nodes.createNode(this, config);
    this.shortName = config.shortName;
  }
  RED.nodes.registerType(IndySoftNodeTypeNames.SectionConfiguration, nodeConstructor);
};
