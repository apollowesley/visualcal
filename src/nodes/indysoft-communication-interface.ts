import 'module-alias/register';
import { NodeProperties } from 'node-red';
import { NodeRedRuntimeNode, NodeRed } from '../@types/logic-server';
import { CommunicationInterface } from '../drivers/communication-interfaces/CommunicationInterface';
import { SerialInterface } from '../drivers/communication-interfaces/SerialInterface';
import { PrologixGpibUsbInterface } from '../drivers/communication-interfaces/prologix/PrologixGpibUsbInterface';
import { PrologixGpibTcpInterface } from '../drivers/communication-interfaces/prologix/PrologixGpibTcpInterface';

export const NODE_TYPE = 'indysoft-communication-interface';

export interface RuntimeProperties extends NodeProperties {
  configType: string;
  serialConfigNodeId?: string;
  prologixGpibUsbConfigNodeId?: string;
  prologixGpibTcpConfigNodeId?: string;
}

export interface RuntimeNode extends NodeRedRuntimeNode {
  configType: string;
  serialConfigNode?: any;
  prologixUsbConfigNode?: any;
  prologixTcpConfigNode?: any;
  communicationInterface?: CommunicationInterface;
}

module.exports = (RED: NodeRed) => {
  // node constructor - node-red calls this, once, on startup to allow this node to initialize (grab any node config and attach to the input event)
  function nodeConstructor(this: RuntimeNode, config: RuntimeProperties) {
    RED.nodes.createNode(this, config);
    this.configType = config.configType;
    switch (this.configType) {
      case 'serial':
        if (!config.serialConfigNodeId) {
          this.error('Serial interface selected but no configuration was found');
          return;
        }
        this.serialConfigNode = RED.nodes.getNode(config.serialConfigNodeId);
        this.communicationInterface = new SerialInterface();
        break;
      case 'prologixUsb':
        if (!config.prologixGpibUsbConfigNodeId) {
          this.error('Prologix GPIB USB interface selected but no configuration was found');
          return;
        }
        this.prologixUsbConfigNode = RED.nodes.getNode(config.prologixGpibUsbConfigNodeId);
        this.communicationInterface = new PrologixGpibUsbInterface();
        break;
      case 'prologixTcp':
        if (!config.prologixGpibTcpConfigNodeId) {
          this.error('Prologix GPIB TCP interface selected but no configuration was found');
          return;
        }
        this.prologixTcpConfigNode = RED.nodes.getNode(config.prologixGpibTcpConfigNodeId);
        this.communicationInterface = new PrologixGpibTcpInterface();
        break;
    }
  }
  RED.nodes.registerType(NODE_TYPE, nodeConstructor);
};
