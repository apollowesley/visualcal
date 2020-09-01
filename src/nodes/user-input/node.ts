import { NodeProperties } from 'node-red';
import { NodeRedRuntimeNode, VisualCalNodeRedNodeInputMessage, NodeRed, NodeRedNodeSendFunction, NodeRedNodeDoneFunction, NodeResetOptions } from '../../@types/logic-server';

export const NODE_TYPE = 'indysoft-user-input';

export interface RuntimeProperties extends NodeProperties {
  title: string;
  text: string;
  append?: string;
  dataType: 'string' | 'float' | 'integer' | 'boolean';
  showImage: string;
  assetFilename?: string;
}

export interface RuntimeNode extends NodeRedRuntimeNode {
  title: string;
  text: string;
  append?: string;
  dataType: 'string' | 'float' | 'integer' | 'boolean';
  showImage: boolean;
  assetFilename?: string;
  currentMessage?: VisualCalNodeRedNodeInputMessage;
}

module.exports = (RED: NodeRed) => {
  console.info('indysoft-user-input main export function called.');
  function nodeConstructor(this: RuntimeNode, config: RuntimeProperties) {
    console.info('indysoft-user-input node constructor called.');
    RED.nodes.createNode(this, config);
    this.title = config.title;
    this.text = config.text;
    this.append = config.append;
    this.dataType = config.dataType;
    this.showImage = !!config.showImage;
    this.assetFilename = config.assetFilename;
    const resetStatus = () => {
      this.status({});
    };
    this.on('input', async (msg: VisualCalNodeRedNodeInputMessage, send: NodeRedNodeSendFunction, done?: NodeRedNodeDoneFunction) => {
      if (!msg.payload || !msg.payload.section || !msg.payload.action) return;
      // We got an input directly from the previous node, so we need to send our info to the frontend and wait for a response
      this.currentMessage = msg;
      await global.visualCal.userInteractionManager.showInput({
        type: 'input',
        nodeId: this.id,
        section: msg.payload.section,
        action: msg.payload.action,
        title: this.title,
        text: this.text,
        append: this.append,
        dataType: this.dataType,
        ok: true,
        cancel: true,
        showImage: this.showImage,
        assetFilename: this.showImage ? this.assetFilename : undefined
      });
      this.status({
        fill: 'yellow',
        shape: 'dot',
        text: 'Waiting for response from user'
      });
      if (done) done();
    });
    this.on('response', (options: UserInputResponse) => {
      // We got a response from the frontend, or our original message is missing properties.  Either way, we're free to forward the message to the next node
      this.status({});
      if (!options.cancel && this.currentMessage) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.currentMessage.payload as any).value = options.result;
        this.send(this.currentMessage);
      }
      this.currentMessage = undefined;
    });
    this.on('reset', (options?: NodeResetOptions) => {
      if (options && options.targetId === this.id) resetStatus();
      else if (!options) resetStatus();
    });
  }
  RED.nodes.registerType(NODE_TYPE, nodeConstructor);
};
