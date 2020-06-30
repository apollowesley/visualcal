import { NodeProperties } from 'node-red';
import { NodeRedRuntimeNode, NodeRedNodeMessage, NodeRed, NodeRedNodeSendFunction, NodeRedNodeDoneFunction } from '../@types/logic-server';

export const NODE_TYPE = 'indysoft-scalar-result';

export interface RuntimeProperties extends NodeProperties {
  description: string;
  baseQuantity?: string;
  derivedQuantity?: string;
  derivedQuantityPrefix?: string;
  deviceType: string;
  multimeterMode: string;
  toleranceType: string;
  inputLevel: string;
  min: string;
  max: string;
}

export interface RuntimeNode extends NodeRedRuntimeNode {
  description: string;
  baseQuantity?: string;
  derivedQuantity?: string;
  derivedQuantityPrefix?: string;
  toleranceType: string;
  inputValue: number;
  min: number;
  max: number;
}

export interface InputMessagePayload {
  sessionId: string;
  runId: string;
  section: string;
  action: string;
  value: any;
}

export interface InputMessage extends NodeRedNodeMessage {
  payload: InputMessagePayload;
}

module.exports = (RED: NodeRed) => {
  function nodeConstructor(this: RuntimeNode, config: RuntimeProperties) {
    RED.nodes.createNode(this, config);
    this.description = config.description;
    this.toleranceType = config.toleranceType;
    this.inputValue = parseFloat(config.inputLevel);
    this.min = parseFloat(config.min);
    this.max = parseFloat(config.max);
    if (config.baseQuantity !== 'unitless' && config.derivedQuantity && config.derivedQuantityPrefix) {
      this.derivedQuantity = config.derivedQuantity;
      this.derivedQuantityPrefix = config.derivedQuantityPrefix;
    }
    this.on('input', (msg: InputMessage, send: NodeRedNodeSendFunction, done?: NodeRedNodeDoneFunction) => {
      // Make sure we have a msg.payload and msg.payload.data (the data read from the device)
      if (!msg.payload || typeof msg.payload.value === 'undefined') {
        this.error('msg.payload or msg.payload.value does not exist');
        if (done) done();
        return;
      }
      // Make sure we have section and action in the msg.payload
      if (!msg.payload.section && !msg.payload.action) {
        this.error('Missing Action Name or Read Tag');
        if (done) done();
        return;
      }
      let measuredValue = 0;
      if (typeof msg.payload.value === 'string') measuredValue = parseFloat(msg.payload.value);
      else if(typeof msg.payload.value === 'number') measuredValue = msg.payload.value;
      const result: LogicResult = {
        sessionId: msg.payload.sessionId,
        runId: msg.payload.runId,
        section: msg.payload.section,
        action: msg.payload.action,
        type: 'scalar',
        description: this.description,
        timestamp: new Date(Date.now()),
        baseQuantity: this.baseQuantity,
        derivedQuantity: this.derivedQuantity,
        derivedQuantityPrefix: this.derivedQuantityPrefix === 'none' ? '' : this.derivedQuantityPrefix,
        inputLevel: this.inputValue,
        minimum: this.min,
        maximum: this.max,
        rawValue: msg.payload.value,
        measuredValue: measuredValue,
        passed: false
      };
      result.passed = (measuredValue >= this.min) && (this.max >= measuredValue);
      this.status({
        fill: result.passed ? 'green' : 'red',
        shape: 'dot',
        text: `Last: ${result.passed ? 'Passed' : 'Failed'} | ${result.measuredValue}`
      });
      global.visualCal.logger.info('result', {
        type: 'result',
        sessionId: msg.payload.sessionId,
        runId: msg.payload.runId,
        section: msg.payload.section,
        action: msg.payload.action,
        result: result
      });
      RED.settings.onActionResult({
        type: 'result',
        sessionId: msg.payload.sessionId,
        runId: msg.payload.runId,
        section: msg.payload.section,
        action: msg.payload.action,
        result: result
      });
      // Delay sending to the next node, in case it's a completed node, so that our result gets to the frontend first.
      // 100ms for now, but we don't know how long it should be delayed, yet.
      setTimeout(() => {
        send({ payload: result });
        if (done) done();
      }, 100);
    });
  }
  RED.nodes.registerType(NODE_TYPE, nodeConstructor);
};
