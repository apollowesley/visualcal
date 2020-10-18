import { NodeRed, NodeRedNodeDoneFunction, NodeRedNodeMessage, NodeRedNodeSendFunction, NodeRedRuntimeNode } from '../@types/logic-server';
import RED from 'node-red';
import VisualCalNodeRed, { CustomDriverConfigurationNodeEditorDefinition } from '../main/node-red';
import { DriverBuilder } from '../main/managers/DriverBuilder';
import { sleep } from '../drivers/utils';

const nodeRed = RED as NodeRed;
const visualCalNodeRed = VisualCalNodeRed();

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
  instructionSetIds: string[];
}

export interface CustomDriverNodeRedRuntimeNode extends NodeRedRuntimeNode {
  driverConfigId: string;
  instructionSetIds: string[];
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
  this.instructionSetIds = config.instructionSetIds;
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
    for (const id of this.instructionSetIds) {
      const instructionSet = driver.instructionSets.find(i => i.id === id);
      if (instructionSet) {
        for (const instruction of instructionSet.instructions) {
          this.status({ fill: 'green', shape: 'dot', text: `Processing instruction: ${instruction.name}` });
          if (instruction.delayBefore && instruction.delayBefore > 0) await sleep(instruction.delayBefore);
          let response: string | number | ArrayBufferLike | boolean | undefined = undefined;
          switch (instruction.type) {
            case 'Query':
              this.status({ fill: 'green', shape: 'dot', text: 'Waiting for query response...' });
              response = await commInterface.queryString(instruction.command);
              break;
            case 'Read':
              this.status({ fill: 'green', shape: 'dot', text: 'Waiting for read response...' });
              response = await commInterface.read();
              break;
            case 'Write':
              this.status({ fill: 'green', shape: 'dot', text: `Writing command to device: ${instruction.command}` });
              await commInterface.write(new TextEncoder().encode(instruction.command));
              break;
          }
          const rawResponse = response;
          if (response) {
            if (instruction.responseDataType) {
              switch (instruction.responseDataType) {
                case 'Binary':
                  if (typeof response === 'string') response = new TextEncoder().encode(response);
                  break;
                case 'Boolean':
                  response = !!response;
                  break;
                case 'Number':
                  if (typeof response === 'string') response = parseFloat(response);
                  if (typeof response === 'object') response = parseFloat(new TextDecoder().decode(response));
                  break;
                case 'String':
                  if (typeof response === 'object') response = new TextDecoder().decode(response);
                  break;
              }
            }
            this.status({ fill: 'green', shape: 'dot', text: `Last read: ${response}` });
            send([null, { ...msg, payload: { ...msg.payload, instruction: instruction, value: { raw: rawResponse, value: response } } }]);
          }
          if (instruction.delayAfter && instruction.delayAfter > 0) await sleep(instruction.delayAfter);
        };
      }
    };
    if (done) done();
  });
}

module.exports = (RED: NodeRed) => {
  RED.nodes.registerType('indysoft-custom-driver', indySoftCustomDriver as any);
};
