import { NodeRed, ProcedureRuntimeNode, ProcedureRuntimeProperties } from '../@types/logic-server';
import { IndySoftNodeTypeNames } from '../constants';

module.exports = (RED: NodeRed) => {
  function nodeConstructor(this: ProcedureRuntimeNode, config: ProcedureRuntimeProperties) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.shortName = config.shortName;
  }
  RED.nodes.registerType(IndySoftNodeTypeNames.Procedure, nodeConstructor);
};
