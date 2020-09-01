import fs from 'fs-extra';
import { NodeRedFlowNode } from '../../../@types/node-red-info';
import sanitizeDirectory from 'sanitize-filename';
import { IndySoftNodeTypeNames } from '../../../constants';
import { EditorNode as IndySoftActionStartEditorNode } from '../../../nodes/action-start/types';
import { EditorNode as IndySoftSectionConfigurationEditorNode } from '../../../nodes/section-configuration/types';

export default class FlowFileHelper {

  private fNodes: NodeRedFlowNode[];

  constructor(nodes: NodeRedFlowNode[]) {
    this.fNodes = nodes;
  }

  get nodes() {
    return this.fNodes.filter(n => n.type !== 'tab');
  }

  get tabs() {
    return this.fNodes.filter(n => n.type === 'tab');
  }

  get procedure() {
    return this.nodes.find(n => n.type === IndySoftNodeTypeNames.Procedure) as ProcedureRuntimeProperties | undefined;
  }

  get sections() {
    return this.nodes.filter(n => n.type === IndySoftNodeTypeNames.SectionConfiguration) as IndySoftSectionConfigurationEditorNode[];
  }

  get actions() {
    return this.nodes.filter(n => n.type === IndySoftNodeTypeNames.ActionStart) as IndySoftActionStartEditorNode[];
  }

  findNodeById(id: string) {
    return this.nodes.find(n => n.id.toUpperCase() === id.toUpperCase());
  }

  findSection(shortName: string) {
    return this.sections.find(s => s.shortName.toUpperCase() === shortName.toUpperCase());
  }

  getSectionActions(sectionShortName: string) {
    const section = this.findSection(sectionShortName);
    if (!section) throw new Error(`Section with short name "${sectionShortName} does not exist`);
    return this.actions.filter(a => a.sectionConfigId === section.id);
  }

  addSection(name: string, generateId: () => string) {
    const existingSection = this.sections.find(n => n.name.toUpperCase() === name.toUpperCase());
    if (existingSection) throw new Error(`A section named "${name}" already exists`);
    const shortName = sanitizeDirectory(name.replace(' ', ''));
    const newSection: IndySoftSectionConfigurationEditorNode = {
      id: generateId(),
      disabled: false,
      name: name,
      shortName: shortName,
      info: '',
      type: IndySoftNodeTypeNames.SectionConfiguration
    };
    this.fNodes.push(newSection);
    return newSection;
  }

  deleteSection(sectionShortName: string) {
    const section = this.findSection(sectionShortName);
    if (!section) throw new Error(`Section with short name "${sectionShortName} does not exist`);
    const actions = this.getSectionActions(sectionShortName);
    actions.forEach(a => {
      const connectedActionNodes = this.getConnectedNodes(a);
      connectedActionNodes.forEach(can => {
        const canIndex = this.nodes.findIndex(n => n.id === can.id);
        this.fNodes.splice(canIndex, 1);
      });
      const actionIndex = this.nodes.findIndex(n => n.id === a.id);
      this.fNodes.splice(actionIndex, 1);
    });
    const sectionIndex = this.nodes.findIndex(n => n.id === section.id);
    this.fNodes.splice(sectionIndex, 1);
  }

  getConnectedNodes(node: NodeRedFlowNode, previousNodes: NodeRedFlowNode[] = []) {
    const retVal: NodeRedFlowNode[] = previousNodes;
    if (node.wires) node.wires.forEach(wires => {
      wires.forEach(nodeID => {
        const existingNode = retVal.find(n => n.id === nodeID);
        if (existingNode) return;
        const node = this.findNodeById(nodeID);
        if (!node) return;
        retVal.push(node);
        return this.getConnectedNodes(node, retVal);
      });
    });
    return retVal;
  }

  async save(path: string) {
    await fs.writeJson(path, this.fNodes, { encoding: 'utf-8', spaces: 2 });
  }

  static async fromFile(path: string) {
    const nodes = (await fs.readJson(path)) as NodeRedFlowNode[];
    return new FlowFileHelper(nodes);
  }

}
