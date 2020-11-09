import { NodeProperties } from 'node-red';
import { NodeRedRuntimeNode, NodeRedNodeMessage, NodeRed, NodeRedNodeSendFunction, NodeRedNodeDoneFunction } from '../@types/logic-server';
import electronLog from 'electron-log';
import { v4 as uuid } from 'uuid';
import { RunManager } from '../main/managers/RunManager';
import { NumericMeasurement, LogicResult } from 'visualcal-common/dist/result';

const NODE_TYPE = 'indysoft-scalar-result';

const log = electronLog.scope(NODE_TYPE);

interface RuntimeProperties extends NodeProperties {
  description: string;
  baseQuantity?: string;
  derivedQuantity?: string;
  derivedQuantityPrefix?: string;
  deviceType: string;
  toleranceType: string;
  inputLevel: string;
  min: string;
  max: string;
}

interface RuntimeNode extends NodeRedRuntimeNode {
  description: string;
  baseQuantity?: string;
  derivedQuantity?: string;
  derivedQuantityPrefix?: string;
  toleranceType: string;
  inputValue: number;
  min: number;
  max: number;
}

interface InputMessagePayload {
  runId: string;
  value: string | number | NumericMeasurement<string, number>;
  result?: LogicResult<string, number>; // Used for output message
}

interface InputMessage extends NodeRedNodeMessage {
  payload: InputMessagePayload;
}

module.exports = function(RED: NodeRed) {
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
      if (!msg.payload.runId) {
        this.error('Missing Action Name or Read Tag');
        if (done) done();
        return;
      }
      let measuredValue = 0;
      let rawValue: string = measuredValue.toString();
      if (typeof msg.payload.value === 'string') measuredValue = parseFloat(msg.payload.value);
      else if(typeof msg.payload.value === 'number') measuredValue = msg.payload.value;
      else if(typeof msg.payload.value === 'object') {
        measuredValue = msg.payload.value.value;
        rawValue = msg.payload.value.raw;
      };
      const result: LogicResult<string, number> = {
        id: uuid(),
        runId: msg.payload.runId,
        type: 'scalar',
        description: this.description,
        timestamp: new Date(Date.now()),
        baseQuantity: this.baseQuantity,
        derivedQuantity: this.derivedQuantity,
        derivedQuantityPrefix: this.derivedQuantityPrefix === 'none' ? '' : this.derivedQuantityPrefix,
        minimum: this.min,
        maximum: this.max,
        inputLevel: this.inputValue,
        rawValue: rawValue,
        measuredValue: measuredValue,
        passed: (measuredValue >= this.min) && (this.max >= measuredValue)
      };
      this.status({
        fill: result.passed ? 'green' : 'red',
        shape: 'dot',
        text: `Last: ${result.passed ? 'Passed' : 'Failed'} | ${result.measuredValue}`
      });
      RunManager.instance.addResult(msg.payload.runId ,result);
      // Delay sending to the next node, in case it's a completed node, so that our result gets to the frontend first.
      // 100ms for now, but we don't know how long it should be delayed, yet.
      setTimeout(() => {
        msg.payload.result = result;
        send(msg);
        if (done) done();
      }, 100);
    });
  }
  RED.nodes.registerType(NODE_TYPE, nodeConstructor);
};
