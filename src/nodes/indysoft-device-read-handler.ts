import 'module-alias/register';
import { NodeProperties } from 'node-red';
import { getFlowSectionName } from './utils';
import { NodeRedRuntimeNode, NodeRed, NodeRedNodeMessage, NodeRedNodeSendFunction, NodeRedNodeDoneFunction } from '../@types/logic-server';

export const NODE_TYPE = 'indysoft-device-read-handler';

export interface InterfaceResponse {
  tag: any;
}

export interface RuntimeProperties extends NodeProperties {
  responses: InterfaceResponse[];
}

export interface RuntimeNode extends NodeRedRuntimeNode {
  responses: InterfaceResponse[];
}


module.exports = (RED: NodeRed) => {
  function nodeConstructor(this: RuntimeNode, config: RuntimeProperties) {
    RED.nodes.createNode(this, config);
    this.responses = config.responses;
    this.on('input', (msg: NodeRedNodeMessage, send: NodeRedNodeSendFunction, done?: NodeRedNodeDoneFunction) => {
      if (!msg.payload) {
        this.error('Missing message payload');
        if (done) done();
        return;
      }
      const isCanceled = this.context().global.get('isCanceled');
      const isRunning = this.context().global.get('isRunning');
      if (!isRunning || isCanceled) {
        if (done) done();
        return;
      }
      const section = getFlowSectionName(this);
      if (section && msg.payload && msg.payload.tag && msg.payload.tag.section && (section.toUpperCase() !== msg.payload.tag.section.toUpperCase())) {
        if (done) done();
        return;
      }
      if (!this.responses) {
        this.error('No expected responses configured');
        RED.settings.onComment('logic', this, 'error', 'No expected responses configured');
        if (done) done();
        return;
      }
      if (!msg.payload) {
        this.error('Message missing payload');
        RED.settings.onComment('logic', this, 'error', 'Message missing payload');
        if (done) done();
        return;
      }
      if (!msg.payload.data) {
        this.error('Message missing payload.data');
        RED.settings.onComment('logic', this, 'error', 'Message missing payload.data');
        if (done) done();
        return;
      }
      if (!msg.payload.readOperation) {
        this.error('Message missing payload.readOperation');
        RED.settings.onComment('logic', this, 'error', 'Message missing payload.readOperation');
        if (done) done();
        return;
      }
      if (!msg.payload.readOperation.readTag) {
        this.error('Message missing payload.readOperation.tag');
        RED.settings.onComment('logic', this, 'error', 'Message missing payload.readOperation.tag');
        if (done) done();
        return;
      }

      const returnMessages: Array<any> = [];
      let lastTag: string | undefined;
      RED.settings.onComment('logic', this, 'debug', 'Begin handling device response');
      this.responses.forEach(expectedResponse => {
        // Determine if we found an incoming response for this expected response
        if (msg.payload.readOperation && (expectedResponse.tag === msg.payload.readOperation.readTag)) {
          // If so, add it to the return messages array
          returnMessages.push({ payload: msg.payload });
          lastTag = expectedResponse.tag;
        } else {
          // Otherwise add a null to the return messages array so everything lines up with the expected outputs
          returnMessages.push(null);
        }
      });
      RED.settings.onComment('logic', this, 'debug', 'End handling device response');
      if (lastTag) {
        this.status({
          fill: 'grey',
          shape: 'dot',
          text: `Last tag: ${lastTag}`
        });
      }
      send(returnMessages);
      if (done) done();
    });
  }
  RED.nodes.registerType(NODE_TYPE, nodeConstructor);
};
