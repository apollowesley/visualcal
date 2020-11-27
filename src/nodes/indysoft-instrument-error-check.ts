import electronLog from 'electron-log';
import { NodeRed, NodeRedNodeDoneFunction, NodeRedNodeMessage, NodeRedNodeSendFunction } from '../@types/logic-server';
import { CommunicationInterface } from '../drivers/communication-interfaces/CommunicationInterface';
import { GpibInterface } from '../drivers/communication-interfaces/GPIB';
import { DriverBuilder } from '../main/managers/DriverBuilder';
import { NodeRedManager } from '../main/managers/NodeRedManager';
import { CustomDriverNodeRedRuntimeNode, CustomDriverNodeUIProperties, findCustomDriverConfigRuntimeNode } from './indysoft-instrument-error-check-types';

interface RuntimeNodeInputEventMessagePayload {
  temp: number;
}

interface RuntimeNodeInputEventMessage extends NodeRedNodeMessage {
  payload?: RuntimeNodeInputEventMessagePayload;
}

let log: electronLog.LogFunctions;

module.exports = function(RED: NodeRed) {
  function indySoftCustomDriver(this: CustomDriverNodeRedRuntimeNode, config: CustomDriverNodeUIProperties) {
    log  = electronLog.scope('indysoft-instrument-error-check');
    RED.nodes.createNode(this, config as any);
    if (config.name) this.name = config.name;
    this.driverConfigId = config.driverConfigId;
    this.checkType = config.checkType;
    this.on('input', async (msg: RuntimeNodeInputEventMessage, send: NodeRedNodeSendFunction, done?: NodeRedNodeDoneFunction) => {
      const setCommInterfaceGpibAddress = async (ci: CommunicationInterface, deviceUnitId: string) => {
        const activeSession = global.visualCal.userManager.activeSession;
        if (!activeSession || !activeSession.configuration) return;
        const foundDevice = activeSession.configuration.devices.find(d => d.unitId === deviceUnitId);
        if (!foundDevice || !foundDevice.gpib) return;
        await ci.setDeviceAddress(foundDevice.gpibAddress);
      }

      try {
        this.status({ fill: 'green', shape: 'dot', text: 'Triggered' });
        const driverConfig = findCustomDriverConfigRuntimeNode(this);
        if (!driverConfig) {
          this.error(`Missing configuration node, ${this.driverConfigId}`);
          this.status({ fill: 'red', shape: 'dot', text: 'Missing configuration node' });
          return;
        }
        const driver = DriverBuilder.instance.getDriver(driverConfig.manufacturer, driverConfig.model);
        if (!driver) {
          this.error(`Missing driver, ${driverConfig.manufacturer} ${driverConfig.model}`);
          this.status({ fill: 'red', shape: 'dot', text: 'Missing driver' });
          return;
        }
        const commInterface = NodeRedManager.instance.utils.getCommunicationInterfaceForDevice(driverConfig.unitId);
        if (!commInterface) {
          this.error(`Missing communication interface for device, ${driverConfig.unitId}`);
          this.status({ fill: 'red', shape: 'dot', text: 'Missing communication interface' });
          return;
        }
        await setCommInterfaceGpibAddress(commInterface, driverConfig.unitId);
        if (driver.terminator) await commInterface.setEndOfStringTerminator(driver.terminator as EndOfStringTerminator);

        const errors: string[] = [];

        let gpibInterface: GpibInterface | undefined = undefined;
        let hasSRQ = false;
        if ('checkSRQ' in commInterface && 'serialPoll' in commInterface && 'setEventStatusEnable' in commInterface) {
          gpibInterface = commInterface as GpibInterface;
        }

        switch (this.checkType) {
          case 'scpi':
            break;
          case 'gpib4882':
            if (gpibInterface) {
              hasSRQ = await gpibInterface.checkSRQ();
              if (hasSRQ) errors.push('SRQ');
            }
            break;
        }

        const errorsToSend = errors.length > 0 ? errors : null;
        if (errorsToSend) {
          this.status({ fill: 'red', shape: 'dot', text: `${errorsToSend.length.toString()} errors` });
        } else {
          this.status({ fill: 'green', shape: 'dot', text: 'No errors' });
        }
        send([errorsToSend, { ...msg, payload: { ...msg.payload, errors: errors } }]);
        if (done) done();
      } catch (error) {
        this.status({
          fill: 'red',
          shape: 'dot',
          text: error.message
        });
        log.error('Error communicating with device.', error);
        await global.visualCal.actionManager.stop(error);
      }
    });
  }
  RED.nodes.registerType('indysoft-instrument-error-check', indySoftCustomDriver as any);
};
