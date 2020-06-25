import 'module-alias/register';
import { NodeProperties } from 'node-red';
import { NodeRedRuntimeNode, NodeRedNodeMessage, NodeRed, NodeRedNodeSendFunction, NodeRedNodeDoneFunction } from '../@types/logic-server';

export const NODE_TYPE = 'indysoft-device-result';

export interface RuntimeProperties extends NodeProperties {
  description?: string;
  deviceType: string;
  multimeterMode: string;
  toleranceType: string;
  inputLevel?: string;
  min?: string;
  max?: string;
}

export interface RuntimeNode extends NodeRedRuntimeNode {
  description: string;
  deviceType: string;
  multimeterMode?: string;
  toleranceType: string;
  inputLevel: number;
  min: number;
  max: number;
}

export interface InputMessagePayload {
  sessionId: string;
  runId: string;
  section: string;
  action: string;
  data: any;
}

export interface InputMessage extends NodeRedNodeMessage {
  payload: InputMessagePayload;
}

module.exports = (RED: NodeRed) => {
  // node constructor - node-red calls this, once, on startup to allow this node to initialize (grab any node config and attach to the input event)
  function nodeConstructor(this: RuntimeNode, config: RuntimeProperties) {
    RED.nodes.createNode(this, config);
    this.deviceType = config.deviceType!.toString();
    this.description = config.description!.toString();
    this.toleranceType = config.toleranceType.toString();
    if (config.multimeterMode) this.multimeterMode = config.multimeterMode.toString();
    this.inputLevel = parseFloat(config.inputLevel!.toString());
    this.min = parseFloat(config.min!.toString());
    this.max = parseFloat(config.max!.toString());
    // input event (this is where we receive an incoming message (msg) from the previous node connected to our input)
    this.on('input', (msg: InputMessage, send: NodeRedNodeSendFunction, done?: NodeRedNodeDoneFunction) => {
      // Make sure we have a msg.payload and msg.payload.data (the data read from the device)
      if (!msg.payload || !msg.payload.data) {
        this.error('Missing msg.payload or msg.payload.data');
        if (done) done();
        return;
      }
      // Make sure we have section and actionName in the msg.payload
      if (!msg.payload.section && !msg.payload.action) {
        this.error('Missing Action Name or Read Tag');
        if (done) done();
        return;
      }
      let dataString: string = msg.payload.data.toString();
      // remove offending leading + symbols
      if (dataString.startsWith('+')) dataString = dataString.substr(1, dataString.length - 1);
      const measuredValue = parseFloat(dataString);
      const result: LogicResult = {
        sessionId: msg.payload.sessionId,
        runId: msg.payload.runId,
        section: msg.payload.section,
        action: msg.payload.action,
        type: 'scalar',
        description: this.description,
        timestamp: new Date(Date.now()),
        inputLevel: this.inputLevel,
        minimum: this.min,
        maximum: this.max,
        rawValue: msg.payload.data,
        measuredValue: measuredValue,
        passed: (measuredValue >= this.min) && (this.max >= measuredValue)
      };
      RED.settings.onActionResult({
        type: 'result',
        sessionId: msg.payload.sessionId,
        runId: msg.payload.runId,
        section: msg.payload.section,
        action: msg.payload.action,
        result: result
      });
      send({ payload: { section: msg.payload.section, action: msg.payload.action }});
      if (done) done();
    });
  }
  RED.nodes.registerType(NODE_TYPE, nodeConstructor);
};
