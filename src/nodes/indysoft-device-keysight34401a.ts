import 'module-alias/register';
import { DeviceNodeProperties } from '../@types/logic-nodes';
import { NodeRedCommunicationInterfaceRuntimeNode, NodeRedNodeMessage, NodeRed, DeviceConfigurationNode, NodeRedNodeSendFunction, NodeRedNodeDoneFunction } from '../@types/logic-server';
import { Keysight34401A } from '../drivers/devices/digital-multimeters/Keysight34401A';
import { DigitalMultimeterMode } from '../drivers/devices/digital-multimeters/DigitalMultimeter';

export const NODE_TYPE = 'indysoft-device-keysight34401a';

export interface RuntimeProperties extends DeviceNodeProperties {
  mode: string;
  setRate: boolean;
  rate: string;
  setRange: boolean;
  range: string;
  measure: boolean;
  relative: boolean;
  usePreDelay: boolean;
  preDelay: string;
}

export interface RuntimeNode extends NodeRedCommunicationInterfaceRuntimeNode {
  mode: string;
  setRate: boolean;
  rate: number;
  setRange: boolean;
  range: number;
  measure: boolean;
  relative: boolean;
  usePreDelay: boolean;
  preDelay: number;
  device: Keysight34401A;
}

export interface RuntimeNodeInputEventMessagePayload {
  unitId?: string;
  rate?: number;
  range?: number;
  section?: string;
  action?: string;
  rawData: string;
  value: number;
}

export interface RuntimeNodeInputEventMessage extends NodeRedNodeMessage {
  payload?: RuntimeNodeInputEventMessagePayload;
}

module.exports = (RED: NodeRed) => {
  function nodeConstructor(this: RuntimeNode, config: RuntimeProperties) {
    RED.nodes.createNode(this, config);
    this.isDevice = true;
    this.isGenericDevice = false;
    this.deviceConfigNode = (RED.nodes.getNode(config.deviceConfigId) as DeviceConfigurationNode);
    if (!this.deviceConfigNode) {
      this.error('Please assign a device driver configuration');
      return;
    }
    this.mode = config.mode;
    this.setRate = !!config.setRate;
    this.rate = Number(config.rate);
    this.setRange = !!config.setRange;
    this.range = Number(config.range);
    this.relative = config.relative;
    this.measure = config.measure;
    this.usePreDelay = config.usePreDelay;
    this.preDelay = Number(config.preDelay);
    if (this.preDelay <= 0) this.preDelay = 1000;
    const reset = () => {
      this.status({});
      if (this.communicationInterface) {
        this.communicationInterface.disconnect();
        this.communicationInterface = undefined;
      }
    };
    this.on('input', async (msg: RuntimeNodeInputEventMessage, send: NodeRedNodeSendFunction, done?: NodeRedNodeDoneFunction) => {
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
        this.device = new Keysight34401A();
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
              range: this.range,
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