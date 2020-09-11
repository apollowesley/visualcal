import Denque from 'denque';
import { Socket } from 'net';
import { NodeProperties } from 'node-red';
import { NodeRedNodeMessage, NodeRedRuntimeNode, NodeRed } from '../@types/logic-server';
import { NodeLogManager } from '../main/managers/NodeLogManager';

export const NODE_TYPE = 'prologix-gpib-tcp';

export interface TcpConnection {
  isConnecting: boolean;
  isConnected: boolean;
  queue: Denque<InputMessage>;
  // esline-disable-next-line
  lastMessage?: any;
  client?: Socket;
}

export interface TcpConnections {
  [key: string]: TcpConnection;
}

export interface InputMessagePayload {
  address: number;
  emulated: boolean;
  // esline-disable-next-line
  emulatedResponse: any;
  operations: InterfaceOperation[];
  section: string;
  action: string;
}

export interface InputMessage extends NodeRedNodeMessage {
  payload: InputMessagePayload;
}

export interface RuntimeProperties extends NodeProperties {
  host: string;
  port: string;
}

export interface RuntimeNode extends NodeRedRuntimeNode {
  host: string;
  port: number;
  done?: () => void;
  isClosing: boolean;
  lastReadOperationInfo?: InterfaceOperationInfo;
}

module.exports = (RED: NodeRed) => {

  const socketTimeout: number = RED.settings.socketTimeout || 10000;
  const tcpMsgQueueSize: number = RED.settings.tcpMsgQueueSize || 1000;

  let messageQueue: Denque<InputMessage>;

  const enqueue = (item: InputMessage) => {
    // drop msgs from front of queue if size is going to be exceeded
    if (!messageQueue) messageQueue = new Denque<InputMessage>();
    if (messageQueue.length === tcpMsgQueueSize) messageQueue.shift();
    messageQueue.push(item);
  };

  const dequeue = () => messageQueue.shift();

  function removeTerminators(data: Buffer): Buffer {
    if (data.length <= 0) return data;
    while (data.length > 0 && (data[data.length - 1] === 10 || data[data.length - 1] === 13)) data = data.slice(0, data.length - 1);
    return data;
  }

  // Node constructor
  function nodeConstructor(this: RuntimeNode, config: RuntimeProperties) {
    // Set node constant to this for use down the line
    // Create our node
    RED.nodes.createNode(this, config);

    this.isClosing = false;
    this.lastReadOperationInfo = undefined;
    this.host = config.host;
    this.port = parseInt(config.port);

    // Out client connection
    let client: Socket | undefined = undefined;

    const getIsConnected = () => client && !client.connecting;
    const getIsConnecting = () => client && client.connecting;
    
    let connectTimerHandle: any;

    const clearConnectionTimeout = () => {
      if (connectTimerHandle) {
        clearTimeout(connectTimerHandle);
      }
    };

    const disconnect = () => {
      clearConnectionTimeout();
      if (getIsConnected() && client) {
        client.destroy();
      }
      client = undefined;
    };

    const writeData = (data: any) => {
      if (!client || !getIsConnected()) {
        this.error('A client connection is required', data);
        return;
      }
      client.write(data + '\n');
    };

    const onError = (err: Error) => {
      disconnect();
      this.error('onError', err);
      this.status({
        fill: 'red',
        shape: 'dot',
        text: err.message
      });
      NodeLogManager.instance.error(this, err);
    };

    const processMessageQueue = () => {
      if (!client || !getIsConnected()) {
        this.error('A client connection is required');
        return;
      }
      if (!messageQueue) return;
      const data = dequeue();
      if (!data) return;
      if (!data.payload) return;
      if (!data.payload.operations) return;
      if (!data.payload.address) {
        onError(new Error('No address specified'));
        this.send([null, null, { payload: 'No address specified' }, null]);
        return;
      }
      if (data.payload.address < 0) {
        this.error('GPIB device address is out-of-range', data.payload.address);
        return;
      }
      writeData(`++addr ${data.payload.address}`);
      data.payload.operations.forEach((operation) => {
        switch (operation.type) {
          case 'query':
            writeData(operation.writeData);
            this.lastReadOperationInfo = {
              operation: operation,
              section: data.payload.section,
              action: data.payload.action,
              readTag: operation.readTag
            };
            break;
          case 'write':
            writeData(operation.writeData);
            if (this.done) this.done();
            break;
        }
      });
    };

    const onConnected = () => {
      clearConnectionTimeout();
      if (!client) {
        disconnect();
        return;
      }
      const onConnectedMsg = `Connected to ${this.host}:${this.port}`;
      NodeLogManager.instance.debug(this, onConnectedMsg);
      this.log(onConnectedMsg);
      this.send([{ host: this.host, port: this.port }, null, null, null]);
      this.status({
        fill: 'green',
        shape: 'dot',
        text: 'node-red:common.status.connected'
      });
      writeData('++savecfg 0');
      writeData('++mode 1');
      writeData('++auto 1');
      writeData('++ifc');
      processMessageQueue();
    };

    const onDisconnected = (hadError?: boolean) => {
      if (client) {
        client.destroy();
        client = undefined;
        this.send([null, { host: this.host, port: this.port, hadError: hadError }, null, null]);
        const onConnectedMsg = `Disconnected from ${this.host}:${this.port}`;
        NodeLogManager.instance.debug(this, onConnectedMsg);
        this.log(onConnectedMsg);
      }
      if (hadError) {
        this.status({
          fill: 'red',
          shape: 'dot',
          text: 'Error'
        });
      } else {
        this.status({});
      }
      if (this.done) this.done();
      this.done = undefined;
    };

    const onData = (data: Buffer) => {
      data = removeTerminators(data);
      if (this.lastReadOperationInfo) {
        const payload: InterfaceOperationResponseMessage = {
          data: data,
          readOperation: this.lastReadOperationInfo,
          section: this.lastReadOperationInfo.section,
          action: this.lastReadOperationInfo.action,
          readTag: this.lastReadOperationInfo.readTag
        };
        this.send([null, null, null, payload]);
      }
      if (this.done) this.done();
    };

    const connect = () => {
      if (getIsConnecting()) return;
      if (getIsConnected()) {
        this.warn('Already connected');
        NodeLogManager.instance.warn(this, 'Received request to connect but the node is already connected');
      }
      NodeLogManager.instance.debug(this, `Connecting to ${this.host}:${this.port}`);
      this.status({
        fill: 'blue',
        shape: 'ring',
        text: 'Connecting'
      });
      client = new Socket();
      client.setEncoding('utf8');
      client.once('connect', onConnected);
      client.on('end', onDisconnected);
      client.on('close', onDisconnected);
      client.on('data', onData);
      client.on('error', onError);
      client.on('timeout', () => onError(new Error('Send/receive timeout')));
      client.connect(this.port, this.host);
      connectTimerHandle = setTimeout(onDisconnected, socketTimeout);
    };

    this.on('input', (msg: InputMessage, _send: (msg: any) => void, done?: () => void) => {
      this.done = done;
      if (!msg.payload || !msg.payload.action || !msg.payload.operations) {
        this.error('Invalid msg.payload, disconnecting', msg);
        if (getIsConnected() || getIsConnecting) disconnect();
        return;
      }
      enqueue(msg);
      if (!getIsConnected() && !getIsConnecting()) {
        connect();
      } else {
        processMessageQueue();
      }
    });

    this.on('close', (done?: () => void) => {
      NodeLogManager.instance.debug(this, `Connection to ${this.host}:${this.port} closed`);
      this.isClosing = true;
      this.done = done;
      if (client) {
        client.destroy();
        client = undefined;
      }
      this.status({});
      if (done) done();
    });
  }

  RED.nodes.registerType(NODE_TYPE, nodeConstructor);

};
