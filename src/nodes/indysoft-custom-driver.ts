import { NodeRed, NodeRedNodeDoneFunction, NodeRedNodeMessage, NodeRedNodeSendFunction, NodeRedRuntimeNode } from '../@types/logic-server';
import { CustomDriverConfigurationNodeEditorDefinition, NodeRedManager } from '../main/managers/NodeRedManager';
import { DriverBuilder } from '../main/managers/DriverBuilder';
import { sleep } from '../drivers/utils';
import { CommandParameter, Instruction, InstructionSet } from 'visualcal-common/dist/driver-builder';

interface CommandParameterArgument {
  instructionId: string;
  parameter: CommandParameter;
  value: string | number | boolean;
}

interface InstructionSetToRuntime {
  id: string;
  instructionSet: InstructionSet;
  parameterArguments: CommandParameterArgument[];
}

interface InstructionResponse {
  instruction: Instruction;
  raw: string | number | ArrayBufferLike | boolean;
  value: string | number | ArrayBufferLike | boolean;
}

interface NodeRedNodeUIProperties {
  sectionConfigId?: string;
  name?: string;
  category: string;
  defaults: any;
  credentials?: any;
  inputs?: number;
  outputs?: number;
  color: string;
  paletteLabel?: string | any;
  label?: string | any;
  labelStyle?: string | any;
  inputLabels?: string[] | any;
  outputLabels?: string[] | any;
  icon?: string;
  align?: 'left' | 'right';
  button?: any;
  oneditprepare?: () => void;
  oneditsave?: () => void;
  oneditcancel?: () => void;
  oneditdelete?: () => void;
  oneditresize?: () => void;
  onpaletteadd?: () => void;
  onpaletteremove?: () => void;
}

interface CustomDriverNodeUIProperties extends NodeRedNodeUIProperties {
  driverConfigId: string;
  instructionSets: InstructionSetToRuntime[];
}

interface CustomDriverNodeRedRuntimeNode extends NodeRedRuntimeNode {
  driverConfigId: string;
  instructionSets: InstructionSetToRuntime[];
}

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
      const driverConfig = NodeRedManager.instance.nodes.find(n => n.id === this.driverConfigId);
      if (!driverConfig) {
        this.error(`Missing configuration node, ${this.driverConfigId}`);
        this.status({ fill: 'red', shape: 'dot', text: 'Missing configuration node' });
        return;
      }
      const driverConfigEditorDef = driverConfig.editorDefinition as CustomDriverConfigurationNodeEditorDefinition;
      const driver = DriverBuilder.instance.getDriver(driverConfigEditorDef.manufacturer, driverConfigEditorDef.model);
      if (!driver) {
        this.error(`Missing driver, ${driverConfigEditorDef.manufacturer} ${driverConfigEditorDef.model}`);
        this.status({ fill: 'red', shape: 'dot', text: 'Missing driver' });
        return;
      }
      const commInterface = NodeRedManager.instance.utils.getCommunicationInterfaceForDevice(driverConfigEditorDef.unitId);
      if (!commInterface) {
        this.error(`Missing communication interface for device, ${driverConfigEditorDef.unitId}`);
        this.status({ fill: 'red', shape: 'dot', text: 'Missing communication interface' });
        return;
      }
      const responses: InstructionResponse[] = [];
      let lastRawResponse: string | number | ArrayBufferLike | boolean = '';
      let lastResponse: string | number | ArrayBufferLike | boolean = '';

      const buildCommand = (instructionSet: InstructionSet, instruction: Instruction) => {
        let command = instruction.command;
        if (instruction.parameters) {
          instruction.parameters.forEach(parameter => {
            const editorInstructionSet = this.instructionSets.find(i => i.id === instructionSet.id);
            if (editorInstructionSet) {
              const parameterArgument = editorInstructionSet.parameterArguments.find(a => a.instructionId === instruction.id);
              if (parameterArgument) {
                if (parameter.beforeText) command += parameter.beforeText;
                command += parameterArgument.value;
                if (parameter.afterText) command += parameter.afterText;
              }
            }
          });
        }
        return command;
      };

      for (const InstructionSetToRuntime of this.instructionSets) {
        const instructionSet = driver.instructionSets.find(i => i.id === InstructionSetToRuntime.id);
        if (instructionSet) {
          for (const instruction of instructionSet.instructions) {
            this.status({ fill: 'green', shape: 'dot', text: `Processing instruction: ${instruction.name}` });
            if (instruction.delayBefore && instruction.delayBefore > 0) await sleep(instruction.delayBefore);
            let command = '';
            switch (instruction.type) {
              case 'Query':
                command = buildCommand(instructionSet, instruction);
                this.status({ fill: 'green', shape: 'dot', text: `Querying: ${command}` });
                lastRawResponse = await commInterface.queryString(command);
                break;
              case 'Read':
                this.status({ fill: 'green', shape: 'dot', text: 'Waiting for read response...' });
                lastRawResponse = await commInterface.read();
                break;
              case 'Write':
                command = buildCommand(instructionSet, instruction);
                this.status({ fill: 'green', shape: 'dot', text: `Writing: ${command}` });
                await commInterface.writeString(command);
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
