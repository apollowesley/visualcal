import express from 'express';
import RED from 'node-red';
import { TypedEmitter } from 'tiny-typed-emitter';
import { NodeRed as NodeRedType, NodeRedRuntimeNode, NodeResetOptions, Settings as NodeRedSettings } from '../../../@types/logic-server';
import { NodeRedFlow, NodeRedFlowNode } from '../../../@types/node-red-info';
import { IndySoftNodeTypeNames } from '../../../constants';
import { EditorNode as IndySoftActionStartEditorNode, RuntimeNode as IndySoftActionStartRuntimeNode } from '../../../nodes/indysoft-action-start-types';
import { EditorNode as IndySoftSectionConfigurationEditorNode, RuntimeNode as IndySoftSectionConfigurationRuntimeNode } from '../../../nodes/indysoft-section-configuration-types';
import { EditorNode as IndySoftProcedureSideBarEditorNode, RuntimeNode as IndySoftProcedureSidebarRuntimeNode } from '../../../nodes/procedure-sidebar-types';
import { DeployType, NodeRedNode, NodeRedTypedNode } from './types';
import nodeRedRequestHook from './request-hook';
import { ExpressServer } from '../../servers/express';

export interface CustomDriverConfigurationNodeEditorDefinition extends NodeRedFlowNode {
  unitId: string;
  manufacturer: string;
  model: string;
}

interface Events {
  starting: () => void;
  started: () => void;
  stopping: () => void;
  stopped: () => void;
  sectionActionStarted: (sectionName: string, actionName: string, runId: string) => void;
  sectionActionStopped: (sectionName: string, actionName: string) => void;
  sectionActionReset: (sectionName: string, actionName: string) => void;
}

export class NodeRedManager extends TypedEmitter<Events> {

  public static readonly USER = 'VisualCal';

  public static get instance() { return NodeRedManager.fInstance; }
  private static fInstance = new NodeRedManager();

  private fIsRunning = false;

  private constructor() {
    super();
  }

  get nodeRed() { return RED as NodeRedType; }

  get isRunning() { return this.fIsRunning; }

  start(server: ExpressServer, settings: NodeRedSettings, nodeScriptsDirPath: string) {
    return new Promise<Error | void>(async (resolve, reject) => {
      if (this.isRunning) return reject(new Error('Already running'));
      if (!server.expressInstance || !server.httpInstance) return reject('ExpressServer is not running');
      this.emit('starting');
      this.nodeRed.init(server.httpInstance, settings);
      nodeRedRequestHook(server.expressInstance);
      server.expressInstance.use(settings.httpAdminRoot, NodeRedManager.instance.nodeRed.httpAdmin);
      server.expressInstance.use(settings.httpNodeRoot, NodeRedManager.instance.nodeRed.httpNode);
      server.expressInstance.use('/nodes-public', express.static(nodeScriptsDirPath)); // Some node-red nodes need external JS files, like indysoft-scalar-result needs quantities.js
      if (!this.nodeRed) {
        await this.stop();
        return reject(new Error('node-red must be defined'));
      }
      await this.nodeRed.start();
      this.fIsRunning = true;
      this.emit('started');
      return resolve();
    });
  }

  async stop() {
    await this.nodeRed.stop();
    this.fIsRunning = false;
  }

  /**
   * Get all editor node definitions
   */
  get editorNodes() {
    if (!this.nodeRed || !this.isRunning) throw new Error('Not running');
    const nodes: NodeRedFlowNode[] = [];
    this.nodeRed.nodes.eachNode((node => nodes.push(node as NodeRedFlowNode)));
    return nodes;
  }

  /**
   * Get all runtime nodes
   */
  get runtimeNodes() {
    if (!this.nodeRed || !this.isRunning) throw new Error('Not running');
    const nodes: NodeRedRuntimeNode[] = [];
    const editorNodes = this.editorNodes;
    editorNodes.forEach(editorNode => {
      if (!this.nodeRed) throw new Error('Not running');
      const runtimeNode = this.nodeRed.nodes.getNode(editorNode.id);
      if (runtimeNode) {
        nodes.push(runtimeNode);
      }
    });
    return nodes;
  }

  /**
   * Gets all editor node definitions and runtime nodes
   */
  get nodes() {
    const editorNodes = this.editorNodes;
    const runtimeNodes: NodeRedRuntimeNode[] = this.runtimeNodes;
    const nodes: NodeRedNode[] = [];
    runtimeNodes.forEach(runtimeNode => {
      const editorNode = editorNodes.find(en => en.id === runtimeNode.id);
      if (editorNode) {
        nodes.push({
          id: runtimeNode.id,
          type: runtimeNode.type,
          editorDefinition: editorNode,
          runtime: runtimeNode
        });
      }
    });
    return nodes;
  }

  findNodesByType(type: string) {
    return this.nodes.filter(n => n.type.toLocaleUpperCase() === type.toLocaleUpperCase());
  }

  findTypedNodesByType<TEditorType extends NodeRedFlowNode, TRuntimeType extends NodeRedRuntimeNode>(type: string) {
    const nodes = this.findNodesByType(type);
    const typedNodes: NodeRedTypedNode<TEditorType, TRuntimeType>[] = [];
    nodes.forEach(node => {
      const typedNode: NodeRedTypedNode<TEditorType, TRuntimeType> = {
        id: node.id,
        type: node.type,
        editorDefinition: node.editorDefinition as TEditorType,
        runtime: node.runtime as  TRuntimeType
      }
      typedNodes.push(typedNode);
    });
    return typedNodes;
  }

  get procedureSidebarNode() {
    const procedureNodes = this.findTypedNodesByType<IndySoftProcedureSideBarEditorNode, IndySoftProcedureSidebarRuntimeNode>(IndySoftNodeTypeNames.Procedure);
    if (procedureNodes && procedureNodes.length > 0) return procedureNodes[0];
    return undefined;
  }

  get visualCalSectionConfigurationNodes() { return this.findTypedNodesByType<IndySoftSectionConfigurationEditorNode, IndySoftSectionConfigurationRuntimeNode>(IndySoftNodeTypeNames.SectionConfiguration); }

  get visualCalActionStartNodes() { return this.findTypedNodesByType<IndySoftActionStartEditorNode, IndySoftActionStartRuntimeNode>(IndySoftNodeTypeNames.ActionStart); }

  getActionStartNodesForSection = (sectionName: string) => {
    let actionStartNodes = this.visualCalActionStartNodes;
    actionStartNodes = actionStartNodes.filter(n => n.runtime.section !== undefined && n.runtime.section.shortName.toLocaleUpperCase() === sectionName.toLocaleUpperCase());
    return actionStartNodes;
  }

  get sections() {
    const sections: SectionInfo[] = this.visualCalSectionConfigurationNodes.map(n => { return { name: n.runtime.name, shortName: n.runtime.shortName, actions: [] }; });
    sections.forEach(s => {
      s.actions = this.getActionStartNodesForSection(s.shortName).map(a => { return { name: a.runtime.name }; });
    });
    return sections;
  }

  getActionStartNode(sectionName: string, actionName: string) {
    const nodes = this.getActionStartNodesForSection(sectionName);
    return nodes.find(n => n.runtime.name.toLocaleUpperCase() === actionName.toLocaleUpperCase());
  }

  /**
   * Loads a new flow JSON
   * @param flow The flow JSON to load
   * @param deployType How node-red should deploy this flow
   */
  async loadFlow(flow: NodeRedFlow, deployType: DeployType = 'full') {
    if (!this.isRunning) throw new Error('Not running');
    await this.nodeRed.runtime.flows.setFlows({ flows: { flows: flow }, user: NodeRedManager.USER }, deployType); // TODO: node-red setFlows doesn't look right, even though this works
  }

  resetAllNodes() {
    if (!this.isRunning) throw new Error('Not running');
    this.nodeRed.runtime.events.emit('reset');
  }

  startActionNode(sectionName: string, actionName: string, runId: string) {
    const startActionNode = this.getActionStartNode(sectionName, actionName);
    if (!startActionNode) throw new Error(`Unable to find action start node, ${actionName} for section ${sectionName}`);
    if (startActionNode.runtime.isRunning) throw new Error('Already running');
    startActionNode.runtime.emit('start', runId);
    this.emit('sectionActionStarted', sectionName, actionName, runId);
  }

  stopActionNode(sectionName: string, actionName: string) {
    const startActionNode = this.getActionStartNode(sectionName, actionName);
    if (!startActionNode) throw new Error(`Unable to find action start node, ${actionName} for section ${sectionName}`);
    startActionNode.runtime.emit('stop');
    this.emit('sectionActionStopped', sectionName, actionName);
  }

  resetActionNode(sectionName: string, actionName: string) {
    const startActionNode = this.getActionStartNode(sectionName, actionName);
    if (!startActionNode) throw new Error(`Unable to find action start node, ${actionName} for section ${sectionName}`);
    this.stopActionNode(sectionName, actionName);
    startActionNode.runtime.emit('reset');
    this.emit('sectionActionReset', sectionName, actionName);
  }

  /**
   * Resets all instruction nodes (indysoft-instruction-, and currently indysoft-dialog-)
   * @param startFrom Node to start resetting from, not including this node
   */
  resetConnectedInstructionNodes(startFrom: NodeRedRuntimeNode) {
    if (!startFrom.wires) return;
    startFrom.wires.forEach(nodeId => {
      const currentNode = this.runtimeNodes.find(n => n.id === nodeId);
      if (currentNode && currentNode.type === IndySoftNodeTypeNames.UserInput) {
        currentNode.emit('reset');
        this.resetConnectedInstructionNodes(currentNode);
      }
    });
  };

  resetConnectedNodes(startFrom: NodeRedRuntimeNode, options?: NodeResetOptions) {
    if (options && options.targetId !== startFrom.id) return;
    if (!startFrom.wires) return;
    startFrom.wires.forEach(nodeId => {
      const currentNode = this.runtimeNodes.find(n => n.id === nodeId);
      if (currentNode) {
        currentNode.emit('reset');
        this.resetConnectedNodes(currentNode, options);
      }
    });
  };

}