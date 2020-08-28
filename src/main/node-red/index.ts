import express, { Express } from 'express';
import { createServer, Server } from 'http';
import RED from 'node-red';
import { TypedEmitter } from 'tiny-typed-emitter';
import { NodeRed as NodeRedType, NodeRedRuntimeNode, Settings as NodeRedSettings } from '../../@types/logic-server';
import { NodeRedFlow, NodeRedFlowNode } from '../../@types/node-red-info';
import { IndySoftNodeTypeNames } from '../../constants';
import { EditorNode as IndySoftActionStartEditorNode, RuntimeNode as IndySoftActionStartRuntimeNode } from '../../nodes/indysoft-action-start-types';
import { EditorNode as IndySoftSectionConfigurationEditorNode, RuntimeNode as IndySoftSectionConfigurationRuntimeNode } from '../../nodes/indysoft-section-configuration-types';
import { EditorNode as IndySoftProcedureSideBarEditorNode, RuntimeNode as IndySoftProcedureSidebarRuntimeNode } from '../../nodes/procedure-sidebar-types';
import { DeployType, NodeRedNode, NodeRedTypedNode } from './types';

interface Events {
  starting: () => void;
  started: (port: number) => void;
  stopping: () => void;
  stopped: () => void;
  sectionActionStarted: (sectionName: string, actionName: string) => void;
  sectionActionStopped: (sectionName: string, actionName: string) => void;
  sectionActionReset: (sectionName: string, actionName: string) => void;
}

class NodeRed extends TypedEmitter<Events> {

  public static USER = 'VisualCal';

  private fExpress?: Express;
  private fHttpServer?: Server;
  private fNodeRed?: NodeRedType;
  private fIsRunning = false;

  get isRunning() { return this.fIsRunning; }

  start(settings: NodeRedSettings, nodeScriptsDirPath: string, port: number) {
    return new Promise<number | Error>((resolve, reject) => {
      if (this.isRunning) return reject(new Error('Already running'));
      this.emit('starting');
      this.fExpress = express();
      this.fHttpServer = createServer(this.fExpress);
      this.fNodeRed = RED as NodeRedType;
      this.fNodeRed.init(this.fHttpServer, settings);
      this.fExpress.use((req, _, next) => {
        console.info(req.url);
        return next();
      });
      this.fExpress.use(settings.httpAdminRoot, global.visualCal.nodeRed.app.httpAdmin);
      this.fExpress.use(settings.httpNodeRoot, global.visualCal.nodeRed.app.httpNode);
      this.fExpress.use('/nodes-public', express.static(nodeScriptsDirPath)); // Some node-red nodes need external JS files, like indysoft-scalar-result needs quantities.js
      this.fHttpServer.listen(port, 'localhost', async () => {
        if (!this.fNodeRed) {
          await this.stop();
          return reject(new Error('node-red must be defined'));
        }
        await this.fNodeRed.start();
        this.emit('started', port);
        this.fIsRunning = true;
        return resolve(port);
      });
    });
  }

  async stop() {
    if (this.fNodeRed) await this.fNodeRed.stop();
    if (this.fHttpServer) this.fHttpServer.close();
    this.fNodeRed = undefined;
    this.fHttpServer = undefined;
    this.fExpress = undefined;
    this.fIsRunning = false;
  }

  /**
   * Get all editor node definitions
   */
  get editorNodes() {
    if (!this.fNodeRed || !this.isRunning) throw new Error('Not running');
    const nodes: NodeRedFlowNode[] = [];
    this.fNodeRed.nodes.eachNode((node => nodes.push(node as NodeRedFlowNode)));
    return nodes;
  }

  /**
   * Get all runtime nodes
   */
  get runtimeNodes() {
    if (!this.fNodeRed || !this.isRunning) throw new Error('Not running');
    const nodes: NodeRedRuntimeNode[] = [];
    const editorNodes = this.editorNodes;
    editorNodes.forEach(editorNode => {
      if (!this.fNodeRed) throw new Error('Not running');
      const runtimeNode = this.fNodeRed.nodes.getNode(editorNode.id);
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

  get visualCalProcedureSidebarNode() {
    const procedureNodes = this.findTypedNodesByType<IndySoftProcedureSideBarEditorNode, IndySoftProcedureSidebarRuntimeNode>(IndySoftNodeTypeNames.Procedure);
    if (procedureNodes) return procedureNodes[0];
    return undefined;
  }

  get visualCalSectionConfigurationNodes() { return this.findTypedNodesByType<IndySoftSectionConfigurationEditorNode, IndySoftSectionConfigurationRuntimeNode>(IndySoftNodeTypeNames.SectionConfiguration); }

  get visualCalActionStartNodes() { return this.findTypedNodesByType<IndySoftActionStartEditorNode, IndySoftActionStartRuntimeNode>(IndySoftNodeTypeNames.ActionStart); }

  getVisualCalActionStartNodesForSection = (sectionName: string) => {
    let actionStartNodes = this.visualCalActionStartNodes;
    actionStartNodes = actionStartNodes.filter(n => n.runtime.section !== undefined && n.runtime.section.shortName.toLocaleUpperCase() === sectionName.toLocaleUpperCase());
    return actionStartNodes;
  }

  getVisualCalActionStartNode(sectionName: string, actionName: string) {
    const nodes = this.getVisualCalActionStartNodesForSection(sectionName);
    return nodes.find(n => n.runtime.name.toLocaleUpperCase() === actionName.toLocaleUpperCase());
  }

  /**
   * Loads a new flow JSON
   * @param flow The flow JSON to load
   * @param deployType How node-red should deploy this flow
   */
  async loadFlow(flow: NodeRedFlow, deployType: DeployType = 'full') {
    if (!this.fNodeRed || !this.isRunning) throw new Error('Not running');
    await this.fNodeRed.runtime.flows.setFlows({ flows: { flows: flow }, user: NodeRed.USER }, deployType); // TODO: node-red setFlows doesn't look right, even though this works
  }

  resetAllNodes() {
    if (!this.fNodeRed || !this.isRunning) throw new Error('Not running');
    this.fNodeRed.runtime.events.emit('reset');
  }

  startVisualCalActionStartNode(sectionName: string, actionName: string) {
    const startActionNode = this.getVisualCalActionStartNode(sectionName, actionName);
    if (!startActionNode) throw new Error(`Unable to find action start node, ${actionName} for section ${sectionName}`);
    if (startActionNode.runtime.isRunning) throw new Error('Already running');
    startActionNode.runtime.emit('start');
    this.emit('sectionActionStarted', sectionName, actionName);
  }

  stopVisualCalActionStartNode(sectionName: string, actionName: string) {
    const startActionNode = this.getVisualCalActionStartNode(sectionName, actionName);
    if (!startActionNode) throw new Error(`Unable to find action start node, ${actionName} for section ${sectionName}`);
    startActionNode.runtime.emit('stop');
    this.emit('sectionActionStopped', sectionName, actionName);
  }

  resetVisualCalActionStartNode(sectionName: string, actionName: string) {
    const startActionNode = this.getVisualCalActionStartNode(sectionName, actionName);
    if (!startActionNode) throw new Error(`Unable to find action start node, ${actionName} for section ${sectionName}`);
    this.stopVisualCalActionStartNode(sectionName, actionName);
    startActionNode.runtime.emit('reset');
    this.emit('sectionActionReset', sectionName, actionName);
  }

}

const nodeRed = new NodeRed();

export default () => {
  return nodeRed;
}

export const destroy = async () => {
  if (!nodeRed) return;
  await nodeRed.stop();
}
