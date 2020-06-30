import { DeviceNodeProperties } from '../@types/logic-nodes';
import { NodeRedCommunicationInterfaceRuntimeNode, NodeRed, DeviceConfigurationNode, NodeRedNodeMessage, NodeRedNodeSendFunction, NodeRedNodeDoneFunction } from '../@types/logic-server';
import { MultiProductCalibratorDevice } from '../drivers/devices/multi-product-calibrators/MultiProductCalibrator';

export const NODE_TYPE = 'indysoft-device-multi-product-calibrator';

export interface RuntimeProperties extends DeviceNodeProperties {
  mode: string;
  amps?: string;
  volts?: string;
  ohms?: string;
  frequency?: string;
  outputOn: string;
  useDelayBefore: string;
  delayBefore?: string;
}

export interface RuntimeNode extends NodeRedCommunicationInterfaceRuntimeNode {
  mode: string;
  amps: number;
  volts: number;
  ohms: number;
  frequency: number;
  outputOn: boolean;
  useDelayBefore: boolean;
  delayBefore: number;
  device?: MultiProductCalibratorDevice;
}

module.exports = (RED: NodeRed) => {
  function nodeConstructor(this: RuntimeNode, config: RuntimeProperties) {
    RED.nodes.createNode(this, config);
    this.deviceDriverRequiredCategories = ['Multi-Product Calibrator'];
    this.isDevice = true;
    this.isGenericDevice = true;
    this.deviceConfigNode = (RED.nodes.getNode(config.deviceConfigId) as DeviceConfigurationNode);
    if (!this.deviceConfigNode) {
      this.error('Please assign a device driver configuration');
      return;
    }
    this.mode = config.mode;
    if (config.amps) this.amps = parseFloat(config.amps);
    if (config.volts) this.volts = parseFloat(config.volts);
    if (config.ohms) this.ohms = parseFloat(config.ohms);
    if (config.frequency) this.frequency = parseFloat(config.frequency);
    this.outputOn = !!config.outputOn;
    this.useDelayBefore = !!config.useDelayBefore;
    if (this.useDelayBefore && config.delayBefore) {
      this.delayBefore = parseInt(config.delayBefore);
      if (this.delayBefore <= 0) this.delayBefore = 1000;
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
        this.communicationInterface = RED.settings.getCommunicationInterfaceForDevice(this.deviceConfigNode.unitId);
        if (!this.communicationInterface) {
          const errMsg = `Could not find interface for device '${this.deviceConfigNode.unitId}'`;
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
        this.device = await RED.settings.getDriverForDevice(this.deviceConfigNode.unitId) as MultiProductCalibratorDevice;
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
          await this.device.turnOutputOff();
          switch (this.mode) {
            case 'aac':
              this.status({ fill: 'blue', shape: 'dot', text: 'Set Current AC' });
              await this.device.setCurrentAC(this.amps, this.frequency);
              break;
            case 'adc':
              this.status({ fill: 'blue', shape: 'dot', text: 'Set Current DC' });
              await this.device.setCurrentDC(this.amps);
              break;
            case 'vac':
              this.status({ fill: 'blue', shape: 'dot', text: 'Set Voltage AC' });
              await this.device.setVoltageAC(this.volts, this.frequency);
              break;
            case 'vdc':
              this.status({ fill: 'blue', shape: 'dot', text: 'Set Voltage DC' });
              await this.device.setVoltageDC(this.volts);
              break;
            case 'ohms':
              this.status({ fill: 'blue', shape: 'dot', text: 'Set Resistance' });
              await this.device.setResistance(this.ohms);
              break;
            case 'freq':
              this.status({ fill: 'blue', shape: 'dot', text: 'Set Frequency' });
              await this.device.setFrequency(this.volts, this.frequency);
              break;
          }
          await this.device.turnOutputOn();
          this.status({});
          send([null, msg]);
        } catch (error) {
          console.error(error);
          if (this.communicationInterface && this.communicationInterface.isConnected) {
            // Try to turn off the output
            try {
              await this.device.turnOutputOff();
            } catch (error) {
              console.error('Attempted to turn off calibrator output (this error can be expected if the device stopped responding): ', error);
            }
          }
          this.error(error);
          this.status({
            fill: 'red',
            shape: 'dot',
            text: error.message
          });
          send([error, null]);
        } finally {
          // this.communicationInterface.disconnect();
          if (done) done();
        }
      };

      if (this.useDelayBefore && this.delayBefore) {
        setTimeout(async () => {
          await handleInput();
        }, this.delayBefore);
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
