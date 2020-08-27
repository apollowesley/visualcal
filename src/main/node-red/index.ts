import express, { Express } from 'express';
import { Server, createServer } from 'http';
import { TypedEmitter } from 'tiny-typed-emitter';
import { NodeRed as NodeRedType, NodeRedRuntimeNode, Settings as NodeRedSettings } from '../../@types/logic-server';
import RED, { NodeProperties } from 'node-red';

interface NodeRedNode {
  id: string;
  editorDefinition: NodeProperties;
  runtime: NodeRedRuntimeNode;
}

interface Events {
  starting: () => void;
  started: (port: number) => void;
  stopping: () => void;
  stopped: () => void;
}

class NodeRed extends TypedEmitter<Events> {

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
      this.fHttpServer = createServer();
      this.fNodeRed = RED as NodeRedType;
      this.fNodeRed.init(this.fHttpServer, settings);
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
    const nodes: NodeProperties[] = [];
    this.fNodeRed.nodes.eachNode((node => nodes.push(node)));
    return nodes;
  }

  /**
   * Get all runtime nodes
   */
  get runtimeNodes() {
    if (!this.fNodeRed || !this.isRunning) throw new Error('Not running');
    const nodes: NodeRedRuntimeNode[] = [];
    this.fNodeRed.runtime.nodes.eachNode((node => nodes.push(node)));
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
          editorDefinition: editorNode,
          runtime: runtimeNode
        });
      }
    });
    return nodes;
  }

}

let nodeRed: NodeRed | undefined;

export default () => {
  if (!nodeRed) nodeRed = new NodeRed();
  return nodeRed;
}

export const destroy = async () => {
  if (!nodeRed) return;
  await nodeRed.stop();
  nodeRed = undefined;
}
