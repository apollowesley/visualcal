import { NodeRed, NodeRedNodeDoneFunction, NodeRedNodeMessage, NodeRedNodeSendFunction } from '../@types/logic-server';
import { NodeRedManager } from '../main/managers/NodeRedManager';
import { DriverBuilder } from '../main/managers/DriverBuilder';
import { sleep } from '../drivers/utils';
import { CommandParameter, CommandParameterArgument, Instruction, InstructionSet } from 'visualcal-common/dist/driver-builder';
import { CustomDriverNodeRedRuntimeNode, InstructionResponse, CustomDriverNodeUIProperties, findCustomDriverConfigRuntimeNode, UIInstructionSet } from './indysoft-custom-driver-types';
import electronLog from 'electron-log';
import { CommunicationInterface } from '../drivers/communication-interfaces/CommunicationInterface';

interface RuntimeNodeInputEventMessagePayload {
  temp: number;
}

interface RuntimeNodeInputEventMessage extends NodeRedNodeMessage {
  payload?: RuntimeNodeInputEventMessagePayload;
}

let log: electronLog.LogFunctions;

module.exports = function(RED: NodeRed) {
  function indySoftCustomDriver(this: CustomDriverNodeRedRuntimeNode, config: CustomDriverNodeUIProperties) {
    log  = electronLog.scope('indysoft-custom-driver');
    RED.nodes.createNode(this, config as any);
    if (config.name) this.name = config.name;
    this.driverConfigId = config.driverConfigId;
    this.instructionSets = config.instructionSets;
    const variables: { _id: string, name: string, defaultValue: string, value: string }[] = [];
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

        const responses: InstructionResponse[] = [];
        let lastRawResponse: string | number | ArrayBufferLike | boolean = '';
        let lastResponse: string | number | ArrayBufferLike | boolean = '';

        const buildInstructionParameter = (parameter: CommandParameter, parameterArguments?: CommandParameterArgument[]) => {
          let retVal = '';
          if (parameter.beforeText) retVal += parameter.beforeText;
          if (parameterArguments && Array.isArray(parameterArguments)) {
            const parameterArgument = parameterArguments.find(a => a.parameter._id === parameter._id);
            if (parameterArgument) {
              retVal += parameterArgument.value;
            }
          }
          if (parameter.type === 'variable' && parameter.variableName) {
            const variable = variables.find(v => v.name === parameter.variableName);
            if (variable && variable.value) {
              retVal += variable.value;
            }
          }
          if (parameter.afterText) retVal += parameter.afterText;
          return retVal;
        }

        if (driver.variables) driver.variables.forEach(variable => {
          variables.push({
            _id: variable._id,
            name: variable.name,
            defaultValue: variable.defaultValue,
            value: variable.defaultValue ? variable.defaultValue : ''
          })
        });

        const buildCommand = (instructionSet: InstructionSet, instruction: Instruction) => {
          let command = instruction.command;
          let preCommandParameter = '';
          let postCommandParameter = '';
          const editorInstructionSet = this.instructionSets.find(i => i.id === instructionSet._id);
          if (editorInstructionSet) {
            if (instruction.preParameters) {
              instruction.preParameters.forEach(parameter => {
                preCommandParameter += buildInstructionParameter(parameter, editorInstructionSet.preParameterArguments);
              });
            }
            if (instruction.postParameters) {
              instruction.postParameters.forEach(parameter => {
                postCommandParameter += buildInstructionParameter(parameter, editorInstructionSet.postParameterArguments);
              });
            }
          }
          command = `${preCommandParameter}${command}${postCommandParameter}`;
          return command;
        };

        for (const InstructionSetToRuntime of this.instructionSets) {
          const instructionSet = driver.instructionSets.find(i => i._id === InstructionSetToRuntime.id);
          if (driver.terminator) {
            await commInterface.setEndOfStringTerminator(driver.terminator as EndOfStringTerminator);
          }
          if (instructionSet) {
            for (const instruction of instructionSet.instructions) {
              this.status({ fill: 'green', shape: 'dot', text: `Processing instruction: ${instruction.name}` });
              if (instruction.delayBefore && instruction.delayBefore > 0) await sleep(instruction.delayBefore);
              let command: number | string | boolean | ArrayBufferLike = buildCommand(instructionSet, instruction);;
              switch (instruction.type) {
                case 'Query':
                  this.status({ fill: 'green', shape: 'dot', text: `Querying: ${command}` });
                  if (this.onBeforeWrite) {
                    const beforeWriteResponse = await this.onBeforeWrite(command);
                    command = beforeWriteResponse.data;
                    if (beforeWriteResponse.cancel) return;
                  }
                  lastRawResponse = await commInterface.queryString(command.toString());
                  DriverBuilder.instance.notifyFrontendDriverReadString(commInterface.name, driverConfig.unitId, lastRawResponse);
                  break;
                case 'Read':
                  this.status({ fill: 'green', shape: 'dot', text: 'Waiting for read response...' });
                  lastRawResponse = await commInterface.read();
                  DriverBuilder.instance.notifyFrontendDriverReadString(commInterface.name, driverConfig.unitId, lastRawResponse);
                  break;
                case 'Write':
                  DriverBuilder.instance.notifyFrontendDriverWrite(commInterface.name, driverConfig.unitId, command);
                  this.status({ fill: 'green', shape: 'dot', text: `Writing: ${command}` });
                  if (this.onBeforeWrite) {
                    const beforeWriteResponse = await this.onBeforeWrite(command);
                    command = beforeWriteResponse.data;
                    if (beforeWriteResponse.cancel) return;
                  }
                  await commInterface.writeString(command.toString());
                  break;
                case 'setVariable':
                  if (instruction.variableName) {
                    const variable = variables.find(v => v.name === instruction.variableName);
                    if (variable) {
                      variable.value = instruction.command; // Command is used as the variable value when instruction.type === 'setVariable'
                    }
                  }
              }
              if (lastRawResponse) {
                if (instruction.responseDataType) {
                  switch (instruction.responseDataType) {
                    case 'Binary':
                      if (typeof lastRawResponse === 'string') lastResponse = new TextEncoder().encode(lastRawResponse);
                      break;
                    case 'Boolean':
                      lastResponse = !!lastRawResponse;
                      break;
                    case 'Number':
                      if (typeof lastRawResponse === 'string') lastResponse = parseFloat(lastRawResponse);
                      if (typeof lastRawResponse === 'object') lastResponse = parseFloat(new TextDecoder().decode(lastRawResponse));
                      break;
                    case 'String':
                      if (typeof lastRawResponse === 'object') lastResponse = new TextDecoder().decode(lastRawResponse);
                      break;
                  }
                }

                this.status({ fill: 'green', shape: 'dot', text: `Last read: ${lastResponse}` });
                responses.push({ instruction: instruction, raw: lastRawResponse, value: lastResponse });
              } else {
                this.status({});
              }
              if (instruction.delayAfter && instruction.delayAfter > 0) await sleep(instruction.delayAfter);
            };
          }
        };
        send([null, { ...msg, payload: { ...msg.payload, responses: responses, value: { raw: lastRawResponse, value: lastResponse } } }]);
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
  RED.nodes.registerType('indysoft-custom-driver', indySoftCustomDriver as any);
};
