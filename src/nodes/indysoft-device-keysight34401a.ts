import { DeviceNodeProperties } from '../@types/logic-nodes';
import { NodeRedCommunicationInterfaceRuntimeNode, NodeRedNodeMessage, NodeRed, DeviceConfigurationNode, NodeRedNodeSendFunction, NodeRedNodeDoneFunction } from '../@types/logic-server';
import { Keysight34401A } from '../drivers/devices/digital-multimeters/Keysight34401A';
import { DigitalMultimeterMode } from '../drivers/devices/digital-multimeters/DigitalMultimeter';
import { getDeviceConfig } from '../main/node-red/utils';
import { DeviceManager } from '../main/managers/DeviceManager';
import { NumericMeasurement } from 'visualcal-common/dist/result';

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
  rearTerminals: boolean;
  setAcFilterHz: boolean;
  acFilterHz: string;
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
  rearTerminals: boolean;
  device: Keysight34401A;
  setAcFilterHz: boolean;
  acFilterHz: number;
}

export interface RuntimeNodeInputEventMessagePayload {
  unitId?: string;
  rate?: number;
  range?: number;
  section?: string;
  action?: string;
  value: NumericMeasurement<string, number>;
}

export interface RuntimeNodeInputEventMessage extends NodeRedNodeMessage {
  payload?: RuntimeNodeInputEventMessagePayload;
}

module.exports = (RED: NodeRed) => {
  function nodeConstructor(this: RuntimeNode, config: RuntimeProperties) {
    RED.nodes.createNode(this, config);
    this.isDevice = true;
    this.isGenericDevice = false;
    this.specificDriverInfo = {
      manufacturer: 'Keysight',
      model: '34401A',
      nomenclature: 'Digital Multimeter'
    };
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
    this.rearTerminals = !!config.rearTerminals;
    this.setAcFilterHz = !!config.setAcFilterHz;
    this.acFilterHz = Number(config.acFilterHz);
    if (this.preDelay <= 0) this.preDelay = 1000;
    const reset = () => {
      this.status({});
    };
    this.device = DeviceManager.instance.get('Keysight 34401A', this.deviceConfigNode.unitId);
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
        const devConfig = getDeviceConfig(this.deviceConfigNode.unitId);
        this.device.setCommunicationInterface(this.communicationInterface);
        try {
          const ibd = this.device as IControllableDevice;
          if (devConfig && devConfig.isGpib) {
            ibd.isGpib = true;
            ibd.gpibPrimaryAddress = devConfig.gpibAddress;
            await this.communicationInterface.setDeviceAddress(devConfig.gpibAddress);
          }
          if (this.measure) {
            this.status({ fill: 'blue', shape: 'ring', text: 'Taking measurement' });
            const measurement = await this.device.getMeasurement({
              mode: this.mode as DigitalMultimeterMode,
              range: this.range,
              relative: this.relative,
              rearTerminals: this.rearTerminals,
              acFilterHz: this.setAcFilterHz ? this.acFilterHz : undefined
            });
            this.status({ fill: 'green', shape: 'dot', text: `Mode: ${this.mode} - ${measurement.value}` });
            // [done, error, measurement]
            if (msg.payload) {
              msg.payload.value = { 
                raw: measurement.raw,
                value: measurement.value
              }
            } else {
              msg.payload = {
                value: {
                  raw: measurement.raw,
                  value: measurement.value
                }
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
