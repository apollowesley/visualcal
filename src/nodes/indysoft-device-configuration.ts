import 'module-alias/register';
import { NodeRed, DeviceConfigurationNode } from '../@types/logic-server';
import { DeviceConfigurationProperties } from '../@types/logic-nodes';
import { IndySoftNodeTypeNames } from '../@types/constants';

module.exports = function(RED: NodeRed) {
  function nodeConstructor(this: DeviceConfigurationNode, config: DeviceConfigurationProperties) {
    RED.nodes.createNode(this, config);
    this.unitId = config.unitId;
  }
  RED.nodes.registerType(IndySoftNodeTypeNames.DeviceConfiguration, nodeConstructor);
};
