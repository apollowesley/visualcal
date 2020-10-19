import { NodeRed, NodeRedNodeDoneFunction, NodeRedNodeMessage, NodeRedNodeSendFunction, NodeRedRuntimeNode } from '../@types/logic-server';
import RED from 'node-red';
import VisualCalNodeRed, { CustomDriverConfigurationNodeEditorDefinition } from '../main/node-red';
import { DriverBuilder } from '../main/managers/DriverBuilder';
import { sleep } from '../drivers/utils';
import { CommandParameter, Instruction, InstructionSet } from 'visualcal-common/dist/driver-builder';

const nodeRed = RED as NodeRed;
const visualCalNodeRed = VisualCalNodeRed();

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

export interface NodeRedNodeUIProperties {
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

export interface CustomDriverNodeUIProperties extends NodeRedNodeUIProperties {
  driverConfigId: string;
  instructionSets: InstructionSetToRuntime[];
}

export interface CustomDriverNodeRedRuntimeNode extends NodeRedRuntimeNode {
  driverConfigId: string;
  instructionSets: InstructionSetToRuntime[];
}

export interface RuntimeNodeInputEventMessagePayload {
  temp: number;
}

export interface RuntimeNodeInputEventMessage extends NodeRedNodeMessage {
  payload?: RuntimeNodeInputEventMessagePayload;
}

function indySoftCustomDriver(this: CustomDriverNodeRedRuntimeNode, config: CustomDriverNodeUIProperties) {
  nodeRed.nodes.createNode(this, config as any);
  if (config.name) this.name = config.name;
  this.driverConfigId = config.driverConfigId;
  this.instructionSets = config.instructionSets;
  this.on('input', async (msg: RuntimeNodeInputEventMessage, send: NodeRedNodeSendFunction, done?: NodeRedNodeDoneFunction) => {
    this.status({ fill: 'green', shape: 'dot', text: 'Triggered' });
    const driverConfig = visualCalNodeRed.nodes.find(n => n.id === this.driverConfigId);
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
    const commInterface = global.visualCal.nodeRed.app.settings.getCommunicationInterfaceForDevice(driverConfigEditorDef.unitId);
    if (!commInterface) {
      this.error(`Missing communication interface for device, ${driverConfigEditorDef.unitId}`);
      this.status({ fill: 'red', shape: 'dot', text: 'Missing communication interface' });
      return;
    }
    const responses: InstructionResponse[] = [];
    let lastRawResponse: string | number | ArrayBufferLike | boolean = '';
    let lastResponse: string | number | ArrayBufferLike | boolean = '';
    for (const InstructionSetToRuntime of this.instructionSets) {
      const instructionSet = driver.instructionSets.find(i => i.id === InstructionSetToRuntime.id);
      if (instructionSet) {
        for (const instruction of instructionSet.instructions) {
          this.status({ fill: 'green', shape: 'dot', text: `Processing instruction: ${instruction.name}` });
          if (instruction.delayBefore && instruction.delayBefore > 0) await sleep(instruction.delayBefore);
          switch (instruction.type) {
            case 'Query':
              this.status({ fill: 'green', shape: 'dot', text: 'Waiting for query response...' });
              lastRawResponse = await commInterface.queryString(instruction.command);
              break;
            case 'Read':
              this.status({ fill: 'green', shape: 'dot', text: 'Waiting for read response...' });
              lastRawResponse = await commInterface.read();
              break;
            case 'Write':
              this.status({ fill: 'green', shape: 'dot', text: `Writing command to device: ${instruction.command}` });
              await commInterface.write(new TextEncoder().encode(instruction.command));
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
            if (lastResponse) responses.push({ instruction: instruction, raw: lastRawResponse, value: lastResponse });
          }
          if (instruction.delayAfter && instruction.delayAfter > 0) await sleep(instruction.delayAfter);
        };
      }
    };
    send([null, { ...msg, payload: { ...msg.payload, responses: responses, raw: lastRawResponse, value: lastResponse } }]);
    if (done) done();
  });
}

module.exports = (RED: NodeRed) => {
  RED.nodes.registerType('indysoft-custom-driver', indySoftCustomDriver as any);
};
