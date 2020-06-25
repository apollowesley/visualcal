import 'module-alias/register';
import { NodeRed, SectionRuntimeNode, SectionRuntimeProperties } from '../../@types/logic-server';

module.exports = (RED: NodeRed) => {
  function nodeConstructor(this: SectionRuntimeNode, config: SectionRuntimeProperties) {
    RED.nodes.createNode(this, config);
    this.shortName = config.shortName;
  }
  RED.nodes.registerType(IndySoftNodeTypeNames.SectionConfiguration, nodeConstructor);
};
