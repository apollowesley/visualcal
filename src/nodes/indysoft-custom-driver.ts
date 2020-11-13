import { NodeRed, NodeRedNodeDoneFunction, NodeRedNodeMessage, NodeRedNodeSendFunction, NodeRedRuntimeNode } from '../@types/logic-server';
import { CustomDriverConfigurationNodeEditorDefinition, NodeRedManager } from '../main/managers/NodeRedManager';
import { DriverBuilder } from '../main/managers/DriverBuilder';
import { sleep } from '../drivers/utils';
import { Instruction, InstructionSet } from 'visualcal-common/dist/driver-builder';
import { CustomDriverNodeRedRuntimeNode, InstructionResponse, CustomDriverNodeUIProperties, findCustomDriverConfigRuntimeNode } from './indysoft-custom-driver-types';

interface RuntimeNodeInputEventMessagePayload {
  temp: number;
}

interface RuntimeNodeInputEventMessage extends NodeRedNodeMessage {
  payload?: RuntimeNodeInputEventMessagePayload;
}

module.exports = function(RED: NodeRed) {
  function indySoftCustomDriver(this: CustomDriverNodeRedRuntimeNode, config: CustomDriverNodeUIProperties) {
    RED.nodes.createNode(this, config as any);
    if (config.name) this.name = config.name;
    this.driverConfigId = config.driverConfigId;
    this.instructionSets = config.instructionSets;
    this.on('input', async (msg: RuntimeNodeInputEventMessage, send: NodeRedNodeSendFunction, done?: NodeRedNodeDoneFunction) => {
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
      const responses: InstructionResponse[] = [];
      let lastRawResponse: string | number | ArrayBufferLike | boolean = '';
      let lastResponse: string | number | ArrayBufferLike | boolean = '';

      const buildCommand = (instructionSet: InstructionSet, instruction: Instruction) => {
        let command = instruction.command;
        let preCommandParameters = '';
        let postCommandParameters = '';
        if (instruction.preParameters) {
          instruction.preParameters.forEach(parameter => {
            const editorInstructionSet = this.instructionSets.find(i => i.id === instructionSet._id);
            if (editorInstructionSet) {
              const parameterArgument = editorInstructionSet.parameterArguments.find(a => a.instructionId === instruction._id);
              if (parameterArgument) {
                if (parameter.beforeText) preCommandParameters += parameter.beforeText;
                preCommandParameters += parameterArgument.value;
                if (parameter.afterText) preCommandParameters += parameter.afterText;
              }
            }
          });
        }
        if (instruction.postParameters) {
          instruction.postParameters.forEach(parameter => {
            const editorInstructionSet = this.instructionSets.find(i => i.id === instructionSet._id);
            if (editorInstructionSet) {
              const parameterArgument = editorInstructionSet.parameterArguments.find(a => a.instructionId === instruction._id);
              if (parameterArgument) {
                if (parameter.beforeText) postCommandParameters += parameter.beforeText;
                postCommandParameters += parameterArgument.value;
                if (parameter.afterText) postCommandParameters += parameter.afterText;
              }
            }
          });
        }
        command = `${preCommandParameters}${command}${postCommandParameters}`;
        return command;
      };

      for (const InstructionSetToRuntime of this.instructionSets) {
        const instructionSet = driver.instructionSets.find(i => i._id === InstructionSetToRuntime.id);
        if (instructionSet) {
          for (const instruction of instructionSet.instructions) {
            this.status({ fill: 'green', shape: 'dot', text: `Processing instruction: ${instruction.name}` });
            if (instruction.delayBefore && instruction.delayBefore > 0) await sleep(instruction.delayBefore);
            let command: number | string | boolean | ArrayBufferLike = '';
            switch (instruction.type) {
              case 'Query':
                command = buildCommand(instructionSet, instruction);
                this.status({ fill: 'green', shape: 'dot', text: `Querying: ${command}` });
                if (this.onBeforeWrite) {
                  const beforeWriteResponse = await this.onBeforeWrite(command);
                  command = beforeWriteResponse.data;
                  if (beforeWriteResponse.cancel) return;
                }
                lastRawResponse = await commInterface.queryString(command.toString());
                break;
              case 'Read':
                this.status({ fill: 'green', shape: 'dot', text: 'Waiting for read response...' });
                lastRawResponse = await commInterface.read();
                break;
              case 'Write':
                command = buildCommand(instructionSet, instruction);
                this.status({ fill: 'green', shape: 'dot', text: `Writing: ${command}` });
                if (this.onBeforeWrite) {
                  const beforeWriteResponse = await this.onBeforeWrite(command);
                  command = beforeWriteResponse.data;
                  if (beforeWriteResponse.cancel) return;
                }
                await commInterface.writeString(command.toString());
                break;
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
    });
  }
  RED.nodes.registerType('indysoft-custom-driver', indySoftCustomDriver as any);
};
