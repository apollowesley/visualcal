import 'module-alias/register';
import { NodeProperties } from 'node-red';
import { NodeRedRuntimeNode, VisualCalNodeRedNodeInputMessage, NodeRed, NodeRedNodeSendFunction, NodeRedNodeDoneFunction, NodeResetOptions } from '../types/logic-server';

export const NODE_TYPE = 'indysoft-user-instruction';

export interface RuntimeProperties extends NodeProperties {
  title: string;
  text: string;
  showImage: string;
  imageSourceType?: 'asset' | 'url';
  assetFilename?: string;
  url?: string;
}

export interface RuntimeNode extends NodeRedRuntimeNode {
  title: string;
  text: string;
  showImage: boolean;
  imageSourceType?: 'asset' | 'url';
  assetFilename?: string;
  url?: string;
  currentMessage?: VisualCalNodeRedNodeInputMessage;
}

module.exports = (RED: NodeRed) => {
  function nodeConstructor(this: RuntimeNode, config: RuntimeProperties) {
    RED.nodes.createNode(this, config);
    this.title = config.title;
    this.text = config.text;
    this.showImage = !!config.showImage;
    this.imageSourceType = config.imageSourceType;
    this.url = config.url;
    this.assetFilename = config.assetFilename;
    const resetStatus = () => {
      this.status({});
    };
    this.on('input', (msg: VisualCalNodeRedNodeInputMessage, send: NodeRedNodeSendFunction, done?: NodeRedNodeDoneFunction) => {
      if (!msg.payload || !msg.payload.section || !msg.payload.action) return;
      // We got an input directly from the previous node, so we need to send our info to the frontend and wait for a response
      this.currentMessage = msg;
      RED.settings.onShowInstruction(this, {
        type: 'instruction',
        nodeId: this.id,
        section: msg.payload.section,
        action: msg.payload.action,
        title: this.title,
        text: this.text,
        ok: true,
        cancel: true,
        showImage: this.showImage,
        imageSource: this.imageSourceType,
        assetFilename: this.showImage && this.imageSourceType === 'asset' ? this.assetFilename : undefined,
        imageUrl: this.showImage && this.imageSourceType === 'url' ? this.url : undefined
      });
      this.status({
        fill: 'yellow',
        shape: 'dot',
        text: 'Waiting for response from user'
      });
      if (done) done();
    });
    this.on('response', (options: InstructionResponse) => {
      // We got a response from the frontend, or our original message is missing properties.  Either way, we're free to forward the message to the next node
      this.status({});
      if (!options.cancel && this.currentMessage) this.send(this.currentMessage);
      this.currentMessage = undefined;
    });
    this.on('reset', (options?: NodeResetOptions) => {
      if (options && options.targetId === this.id) resetStatus();
      else if (!options) resetStatus();
    });
  }
  RED.nodes.registerType(NODE_TYPE, nodeConstructor);
};
