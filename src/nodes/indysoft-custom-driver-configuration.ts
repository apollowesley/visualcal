import { NodeRed, DeviceConfigurationNode } from '../@types/logic-server';
import { DeviceConfigurationProperties } from '../@types/logic-nodes';

export interface ConfigurationNode extends DeviceConfigurationNode {
  manufacturer: string;
  model: string;
}

export interface ConfigurationProperties extends DeviceConfigurationProperties {
  manufacturer: string;
  model: string;
}

module.exports = function(RED: NodeRed) {

  function nodeConstructor(this: ConfigurationNode, config: ConfigurationProperties) {
    RED.nodes.createNode(this, config);
    this.unitId = config.unitId;
    this.manufacturer = config.manufacturer;
    this.model = config.model;
  }

  RED.nodes.registerType('indysoft-custom-driver-configuration', nodeConstructor);
};
