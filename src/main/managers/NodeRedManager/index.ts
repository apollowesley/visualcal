import express from 'express';
import RED from 'node-red';
import { TypedEmitter } from 'tiny-typed-emitter';
import { NodeRed as NodeRedType, NodeRedRuntimeNode, NodeResetOptions, Settings as NodeRedSettings } from '../../../@types/logic-server';
import { NodeRedFlow, NodeRedFlowNode } from '../../../@types/node-red-info';
import { IndySoftNodeTypeNames } from '../../../constants';
import { EditorNode as IndySoftActionStartEditorNode, RuntimeNode as IndySoftActionStartRuntimeNode } from '../../../nodes/indysoft-action-start-types';
import { EditorNode as IndySoftProcedureSideBarEditorNode, RuntimeNode as IndySoftProcedureSidebarRuntimeNode } from '../../../nodes/procedure-sidebar-types';
import { TypeName as IndySoftInstrumentDriverConfigurationNodeTypeName, ConfigurationProperties as IndySoftInstrumentDriverConfigurationEditorNode, ConfigurationNode as IndySoftInstrumentDriverConfigurationRuntimeNode } from '../../../nodes/indysoft-instrument-driver-configuration-types';
import { TypeName as IndySoftInstrumentDriverNodeTypeName, RuntimeNode as IndySoftInstrumentDriverRuntimeNode, ConfigurationProperties as IndySoftInstrumentDriverEditorNode } from '../../../nodes/indysoft-instrument-driver-types';
import { DeployType, NodeRedNode, NodeRedTypedNode } from './types';
import nodeRedRequestHook from './request-hook';
import { ExpressServer } from '../../servers/express';
import NodeRedVisualCalUtils from '../../node-red/utils';
import electronLog from 'electron-log';
import { CommunicationInterfaceManager } from '../CommunicationInterfaceManager';
import { DriverBuilder } from '../DriverBuilder';
import { Driver } from 'visualcal-common/dist/driver-builder';

export const enum CancelActionReason {
  user
}

interface Events {
  starting: () => void;
  started: () => void;
  stopping: () => void;
  stopped: () => void;
  sectionActionStarted: (sectionName: string, actionName: string, runId: string) => void;
  sectionActionStopped: (sectionName: string, actionName: string) => void;
  sectionActionReset: (sectionName: string, actionName: string) => void;
  sectionActionCancelled: (sectionName: string, actionName: string, reason: CancelActionReason, reasonText?: string) => void;
}

const log = electronLog.scope('NodeRedManager');

export class NodeRedManager extends TypedEmitter<Events> {

  public static readonly USER = 'VisualCal';

  public static get instance() { return NodeRedManager.fInstance; }
  private static fInstance = new NodeRedManager();

  private fIsRunning = false;

  private constructor() {
    super();
    log.info('Loaded');
  }

  get nodeRed() { return RED as NodeRedType; }

  get utils() { return NodeRedVisualCalUtils; }

  get isRunning() { return this.fIsRunning; }

  start(server: ExpressServer, settings: NodeRedSettings, nodeScriptsDirPath: string) {
    return new Promise<void>((resolve, reject) => {
      log.info('Starting');
      if (this.isRunning) return reject(new Error('Already running'));
      if (!server.expressInstance || !server.httpInstance) return reject('ExpressServer is not running');
      this.emit('starting');
      log.info('Initializing node-red');
      this.nodeRed.init(server.httpInstance, settings);
      log.info('Initialized node-red');
      nodeRedRequestHook(server.expressInstance);
      server.expressInstance.use(settings.httpAdminRoot, NodeRedManager.instance.nodeRed.httpAdmin);
      server.expressInstance.use(settings.httpNodeRoot, NodeRedManager.instance.nodeRed.httpNode);
      server.expressInstance.use('/nodes-public', express.static(nodeScriptsDirPath)); // Some node-red nodes need external JS files, like indysoft-scalar-result needs quantities.js
      log.info('Starting node-red');
      this.nodeRed.start().then(() => {
        this.fIsRunning = true;
        this.emit('started');
        log.info('Started node-red');
        return resolve();
      });
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

  get allDriversNodes() {
    return this.findTypedNodesByType<IndySoftInstrumentDriverConfigurationEditorNode, IndySoftInstrumentDriverConfigurationRuntimeNode>(IndySoftInstrumentDriverConfigurationNodeTypeName);
  }

  get allDrivers() {
    const retVal: Driver[] = [];
    this.allDriversNodes.forEach(node => {
      const driver = DriverBuilder.instance.getDriver(node.runtime.manufacturer, node.runtime.model);
      if (driver) retVal.push(driver);
    });
    return retVal;
  }

  getConnectedNodes(node: NodeRedNode, previousNodes: NodeRedNode[] = []) {
    const retVal: NodeRedNode[] = previousNodes;
    if (node.editorDefinition.wires) node.editorDefinition.wires.forEach(wires => {
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

  findNodeById(id: string) {
    return this.nodes.find(n => n.id.toLowerCase() === id.toLowerCase());
  };

  get procedureSidebarNode() {
    const procedureNodes = this.findTypedNodesByType<IndySoftProcedureSideBarEditorNode, IndySoftProcedureSidebarRuntimeNode>(IndySoftNodeTypeNames.Procedure);
    if (procedureNodes && procedureNodes.length > 0) return procedureNodes[0];
    return undefined;
  }

  get visualCalSectionConfigurationNodes() { return this.findTypedNodesByType<NodeRedFlowNode, NodeRedRuntimeNode>(IndySoftNodeTypeNames.SectionConfiguration); }

  get visualCalActionStartNodes() { return this.findTypedNodesByType<IndySoftActionStartEditorNode, IndySoftActionStartRuntimeNode>(IndySoftNodeTypeNames.ActionStart); }

  getActionStartNodesForSection = (sectionName: string) => {
    let actionStartNodes = this.visualCalActionStartNodes;
    actionStartNodes = actionStartNodes.filter(n => n.runtime.section !== undefined && n.runtime.section.name.toLocaleUpperCase() === sectionName.toLocaleUpperCase());
    return actionStartNodes;
  }

  get sections() {
    const sections: SectionInfo[] = this.visualCalSectionConfigurationNodes.map(n => { return { name: n.runtime.name, actions: [] }; });
    sections.forEach(s => {
      s.actions = this.getActionStartNodesForSection(s.name).map(a => { return { name: a.runtime.name }; });
    });
    return sections;
  }

  getActionStartNode(sectionName: string, actionName: string) {
    const nodes = this.getActionStartNodesForSection(sectionName);
    return nodes.find(n => n.runtime.name.toLocaleUpperCase() === actionName.toLocaleUpperCase());
  }

  getAllNodesInAction(sectionName: string, actionName: string) {
    const actionStartNode = this.getActionStartNode(sectionName, actionName);
    if (!actionStartNode) return [];
    const nodesConnectedToActionStartNode = this.getConnectedNodes(actionStartNode);
    return nodesConnectedToActionStartNode;
  }

  getAllDeviceConfigInfoInAction(sectionName: string, actionName: string) {
    const nodesConnectedToActionStartNode = this.getAllNodesInAction(sectionName, actionName);
    const driverNodes = nodesConnectedToActionStartNode.filter(n => n.type === IndySoftInstrumentDriverNodeTypeName);
    const typedDriverNodes = driverNodes.map(n => {
      const typedNode: NodeRedTypedNode<IndySoftInstrumentDriverEditorNode, IndySoftInstrumentDriverRuntimeNode> = {
        id: n.id,
        type: n.type,
        editorDefinition: n.editorDefinition as IndySoftInstrumentDriverEditorNode,
        runtime: n.runtime as IndySoftInstrumentDriverRuntimeNode
      };
      return typedNode;
    });
    const driverConfigs: IndySoftInstrumentDriverConfigurationEditorNode[] = [];
    for (const driverNode of typedDriverNodes) {
      const driverConfigNode = this.findNodeById(driverNode.editorDefinition.driverConfigId);
      if (!driverConfigNode) continue;
      if (!driverConfigs.includes(driverConfigNode.editorDefinition as IndySoftInstrumentDriverConfigurationEditorNode)) driverConfigs.push(driverConfigNode.editorDefinition as IndySoftInstrumentDriverConfigurationEditorNode);
    }
    return driverConfigs.map(n => {
      return {
        unitId: n.unitId,
        manufacturer: n.manufacturer,
        model: n.model
      }
    });
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

  private fCurrentStartActionNode?: NodeRedTypedNode<IndySoftActionStartEditorNode, IndySoftActionStartRuntimeNode>;

  async startAction(sectionName: string, actionName: string, runId: string) {
    if (this.fCurrentStartActionNode) throw new Error(`An action is already running, ${this.fCurrentStartActionNode.runtime.section} - ${this.fCurrentStartActionNode.runtime.name}`);
    this.fCurrentStartActionNode = this.getActionStartNode(sectionName, actionName);
    if (!this.fCurrentStartActionNode) throw new Error(`Unable to find action start node, ${actionName} for section ${sectionName}`);
    await this.resetConnectedNodes(this.fCurrentStartActionNode.runtime);
    await this.fCurrentStartActionNode.runtime.start(runId);
    this.emit('sectionActionStarted', sectionName, actionName, runId);
  }

  async stopCurrentAction() {
    await CommunicationInterfaceManager.instance.disconnectAll();
    if (!this.fCurrentStartActionNode) return;
    if (!this.fCurrentStartActionNode.runtime.section) throw new Error(`Start action node is missing its configuration node, ${this.fCurrentStartActionNode.id}`);
    const section = this.fCurrentStartActionNode.runtime.section.name;
    const action = this.fCurrentStartActionNode.runtime.name;
    await this.fCurrentStartActionNode.runtime.stop();
    await this.resetConnectedNodes(this.fCurrentStartActionNode.runtime);
    this.fCurrentStartActionNode = undefined;
    this.emit('sectionActionStopped', section, action);
  }

  async cancelCurrentAction(reason: CancelActionReason, reasonText?: string) {
    if (!this.fCurrentStartActionNode) return;
    if (!this.fCurrentStartActionNode.runtime.section) return;
    const section = this.fCurrentStartActionNode.runtime.section.name;
    const action = this.fCurrentStartActionNode.runtime.name;
    await this.stopCurrentAction();
    this.emit('sectionActionCancelled', section, action, reason, reasonText);
  }

  /**
   * Resets all instruction nodes (indysoft-instruction-*, and currently indysoft-dialog-*)
   * @param startFrom Node to start resetting from, not including this node
   */
  async resetConnectedInstructionNodes(startFrom: NodeRedRuntimeNode) {
    if (!startFrom.wires) return;
    for (const nodeId of startFrom.wires) {
      const currentNode = this.runtimeNodes.find(n => n.id === nodeId);
      if (currentNode && currentNode.reset) {
        await currentNode.reset();
        await this.resetConnectedInstructionNodes(currentNode);
      }
    };
  };

  async resetConnectedNodes(startFrom: NodeRedRuntimeNode, options?: NodeResetOptions) {
    if (options && options.targetId !== startFrom.id) return;
    if (!startFrom.wires || (startFrom.wires && startFrom.wires.length <= 0)) return;
    for (const nodeId of startFrom.wires) {
      const currentNode = this.runtimeNodes.find(n => n.id === nodeId);
      if (currentNode && currentNode.reset) {
        await currentNode.reset();
        currentNode.emit('reset');
        await this.resetConnectedNodes(currentNode, options);
      }
    };
  };

}
