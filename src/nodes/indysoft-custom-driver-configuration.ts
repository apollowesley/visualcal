import { NodeRed, DeviceConfigurationNode } from '../@types/logic-server';
import { DeviceConfigurationProperties } from '../@types/logic-nodes';
import { ConfigurationNode, ConfigurationProperties } from './indysoft-instrument-driver-configuration-types';

module.exports = function(RED: NodeRed) {

  function nodeConstructor(this: ConfigurationNode, config: ConfigurationProperties) {
    RED.nodes.createNode(this, config);
    this.unitId = config.unitId;
    this.manufacturer = config.manufacturer;
    this.model = config.model;
  }

  RED.nodes.registerType('indysoft-instrument-driver-configuration', nodeConstructor);
};
