import { DeviceNodeProperties } from '../@types/logic-nodes';
import { NodeRedCommunicationInterfaceRuntimeNode, NodeRedNodeMessage, NodeRed, DeviceConfigurationNode, NodeRedNodeSendFunction, NodeRedNodeDoneFunction } from '../@types/logic-server';
import { DigitalMultimeterDevice, DigitalMultimeterMode } from '../drivers/devices/digital-multimeters/DigitalMultimeter';

export const NODE_TYPE = 'indysoft-device-digital-multimeter';

export interface RuntimeProperties extends DeviceNodeProperties {
  mode: string;
  samplesPerSecond: string;
  samplesPerSecondType: string;
  expectedInput: string;
  expectedInputType: string;
  relative: string;
  measure: string;
  usePreDelay: string;
  preDelay: string;
}

export interface RuntimeNode extends NodeRedCommunicationInterfaceRuntimeNode {
  mode: string;
  samplesPerSecond: number;
  expectedInput: number;
  relative: boolean;
  measure: boolean;
  usePreDelay: boolean;
  preDelay: number;
  device?: DigitalMultimeterDevice;
}

export interface RuntimeNodeInputEventMessagePayload {
  unitId?: string;
  rate?: number;
  range?: number;
  address?: number;
  operations?: InterfaceOperation[];
  section?: string;
  action?: string;
}

export interface RuntimeNodeInputEventMessage extends NodeRedNodeMessage {
  emulated?: boolean;
  address?: number;
  payload?: RuntimeNodeInputEventMessagePayload;
}

module.exports = (RED: NodeRed) => {
  function nodeConstructor(this: RuntimeNode, config: RuntimeProperties) {
    RED.nodes.createNode(this, config);
    this.deviceDriverRequiredCategories = ['Digital Multimeter'];
    this.isDevice = true;
    this.isGenericDevice = true;
    this.deviceConfigNode = (RED.nodes.getNode(config.deviceConfigId) as DeviceConfigurationNode);
    if (!this.deviceConfigNode) {
      this.error('Please assign a device driver configuration');
      return;
    }
    this.mode = config.mode;
    // TODO: Use samplesPerSecondType
    this.samplesPerSecond = parseInt(config.samplesPerSecond);
    // TODO: Use expectedInputType
    this.expectedInput = parseFloat(config.expectedInput);
    this.relative = !!config.relative;
    this.measure = !!config.measure;
    this.usePreDelay = !!config.usePreDelay;
    if (this.usePreDelay && config.preDelay) {
      this.preDelay = parseInt(config.preDelay);
      if (this.preDelay <= 0) this.preDelay = 1000;
    }
    const reset = () => {
      this.status({});
      if (this.communicationInterface) {
        this.communicationInterface.disconnect();
        this.communicationInterface = undefined;
      }
    };
    this.on('input', async (msg: NodeRedNodeMessage, send: NodeRedNodeSendFunction, done?: NodeRedNodeDoneFunction) => {
      const handleInput = async () => {
        if (!RED.settings.getCommunicationInterfaceForDevice) {
          const errMsg = 'Node is not being used with a VisualCal server';
          this.error(errMsg, msg);
          this.status({
            fill: 'red',
            shape: 'dot',
            text: errMsg
          });
          return;
        }
        this.communicationInterface = RED.settings.getCommunicationInterfaceForDevice(this.deviceConfigNode.unitId);
        if (!this.communicationInterface) {
          const errMsg = `Could not find interface for device '${this.deviceConfigNode.unitId}'`;
          this.error(errMsg, msg);
          this.status({
            fill: 'red',
            shape: 'dot',
            text: errMsg
          });
          send([{ payload: errMsg }, null]);
          if (done) done();
          return;
        }
        this.device = await RED.settings.getDriverForDevice(this.deviceConfigNode.unitId) as DigitalMultimeterDevice;
        if (!this.device) {
          const errMsg = `Could not find driver for device '${this.deviceConfigNode.unitId}'`;
          RED.settings.onComment('logic', this, 'error', errMsg);
          this.error(errMsg, msg);
          this.status({
            fill: 'red',
            shape: 'dot',
            text: errMsg
          });
          send([{ payload: errMsg }, null]);
          if (done) done();
          return;
        }
        this.device.setCommunicationInterface(this.communicationInterface);
        if (!this.communicationInterface.isConnected) {
          this.status({ fill: 'blue', shape: 'ring', text: 'Connecting' });
          try {
            await this.communicationInterface.connect();
          } catch (error) {
            this.status({ fill: 'red', shape: 'dot', text: error.message });
            send([error, null]);
            return;
          }
        }
        try {
          if (this.measure) {
            this.status({ fill: 'blue', shape: 'ring', text: 'Taking measurement' });
            const measurement = await this.device.getMeasurement({
              mode: this.mode as DigitalMultimeterMode,
              relative: this.relative
            });
            this.status({ fill: 'green', shape: 'dot', text: `Last measurement = Mode: ${this.mode} - Value: ${measurement.toString()}` });
            // [done, error, measurement]
            if (msg.payload) {
              msg.payload.rawData = measurement.toString();
              msg.payload.value = measurement;
            } else {
              msg.payload = {
                rawData: measurement.toString(),
                value: measurement
              };
            }
            send([null, msg]);
          } else {
            this.status({});
            send([null, msg]);
          }
        } catch (error) {
          this.error(error);
          this.status({
            fill: 'red',
            shape: 'dot',
            text: error.message
          });
          send([error, null]);
        } finally {
          // if (this.communicationInterface) this.communicationInterface.disconnect();
          if (done) done();
        }
      };

      if (this.usePreDelay) {
        setTimeout(async () => {
          await handleInput();
        }, this.preDelay);
      } else {
        await handleInput();
      }
    });
    this.on('reset', () => {
      reset();
    });
  }
  RED.nodes.registerType(NODE_TYPE, nodeConstructor);
};
