import { NodeRed, NodeRedNodeDoneFunction, NodeRedNodeMessage, NodeRedNodeSendFunction, NodeRedRuntimeNode } from '../@types/logic-server';
import RED from 'node-red';
import VisualCalNodeRed, { CustomDriverConfigurationNodeEditorDefinition } from '../main/node-red';
import { DriverBuilder } from '../main/managers/DriverBuilder';

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
  this.on('input', (msg: RuntimeNodeInputEventMessage, send: NodeRedNodeSendFunction, done?: NodeRedNodeDoneFunction) => {
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
    this.instructionSetIds.forEach(id => {
      const instructionSet = driver.instructionSets.find(i => i.id === id);
      if (instructionSet) {
        instructionSet.instructions.forEach(async (instruction) => {
          switch (instruction.type) {
            case 'Query':
              const queryResponse = await commInterface.queryString(instruction.command);
              this.send([null, { ...msg, payload: queryResponse }]);
              break;
            case 'Read':
              const readData = await commInterface.read();
              this.send([null, { ...msg, payload: readData }]);
              break;
            case 'Write':
              await commInterface.write(new TextEncoder().encode(instruction.command));
              break;
          }
        });
      }
    });
    if (done) done();
  });
}

module.exports = (RED: NodeRed) => {
  RED.nodes.registerType('indysoft-custom-driver', indySoftCustomDriver as any);
};
