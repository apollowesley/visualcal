import { NodeProperties } from 'node-red';
import { isUtf8 } from 'is-utf8';
import { NodeRedRuntimeNode, NodeRed } from '../@types/logic-server';

export const NODE_TYPE = 'indysoft-mqtt-dynamic-topic-in';

export interface MqttBrokerNode extends NodeRedRuntimeNode {
  broker: string;
  connected: boolean;
  register(node: NodeRedRuntimeNode): void;
  deregister(node: NodeRedRuntimeNode, done?: any): void;
  subscribe(topic: string, qos: number, onSubscribedCallback: any, ref?: any): void;
  unsubscribe(topic: string, ref: any, removed: boolean): void;
}

export interface RuntimeProperties extends NodeProperties {
  topic: string;
  qos: number;
  brokerId: string;
  dataType: string;
}

export interface RuntimeNode extends NodeRedRuntimeNode {
  topic: string;
  qos: number;
  brokerId: string;
  dataType: string;
  brokerConn?: MqttBrokerNode;
  onSubscribed(topic: string, payload: any, packet: { qos: number; retain: boolean }): void;
}

module.exports = (RED: NodeRed) => {
  function nodeConstructor(this: RuntimeNode, config: RuntimeProperties) {
    RED.nodes.createNode(this, config);
    this.topic = config.topic;
    this.qos = config.qos;
    if (isNaN(this.qos) || this.qos < 0 || this.qos > 2) {
      this.qos = 2;
    }
    this.brokerId = config.brokerId;
    this.brokerConn = (RED.nodes.getNode(this.brokerId) as MqttBrokerNode);
    if (!/^(#$|(\+|[^+#]*)(\/(\+|[^+#]*))*(\/(\+|#|[^+#]*))?$)/.test(this.topic)) {
      return this.warn(RED._('indySoft.mqtt.errors.invalid-topic'));
    }
    this.dataType = config.dataType || 'utf8';
    this.onSubscribed = (topic, payload, packet) => {
      if (this.dataType === 'buffer') {
        // payload = payload;
      } else if (this.dataType === 'base64') {
        payload = payload.toString('base64');
      } else if (this.dataType === 'utf8') {
        payload = payload.toString('utf8');
      } else if (this.dataType === 'json') {
        if (isUtf8(payload)) {
          payload = payload.toString();
          try {
            payload = JSON.parse(payload);
          } catch (e) {
            this.error(RED._('indySoft.mqtt.errors.invalid-json-parse'), {
              payload: payload,
              topic: topic,
              qos: packet.qos,
              retain: packet.retain
            });
            return;
          }
        } else {
          this.error((RED._('indySoft.mqtt.errors.invalid-json-string')), {
            payload: payload,
            topic: topic,
            qos: packet.qos,
            retain: packet.retain
          });
          return;
        }
      } else {
        if (isUtf8(payload)) {
          payload = payload.toString();
        }
      }
      const msg = {
        topic: topic,
        payload: payload,
        qos: packet.qos,
        retain: packet.retain
      };
      if (this.brokerConn && ((this.brokerConn.broker === 'localhost') || (this.brokerConn.broker === '127.0.0.1'))) {
        msg.topic = topic;
      }
      this.send(msg);
    };
    if (this.brokerConn) {
      this.status({
        fill: 'red',
        shape: 'ring',
        text: 'node-red:common.status.disconnected'
      });
      if (this.topic) {
        this.brokerConn.register(this);
        this.brokerConn.subscribe(this.topic, this.qos, this.onSubscribed, this.id);
        if (this.brokerConn.connected) {
          this.status({
            fill: 'green',
            shape: 'dot',
            text: 'node-red:common.status.connected'
          });
        }
      } else {
        this.error(RED._('indySoft.mqtt.errors.not-defined'));
      }
      this.on('close', (removed: boolean, done?: any) => {
        if (this.brokerConn) {
          this.brokerConn.unsubscribe(this.topic, this.id, removed);
          this.brokerConn.deregister(this, done);
        } else {
          if (done) done();
        }
      });
      this.on('input', (msg) => {
        if (this.brokerConn) {
          this.brokerConn.unsubscribe(this.topic, this.id, true);
          this.brokerConn.subscribe(msg.topic, this.qos, this.onSubscribed, this.id);
          this.topic = msg.topic;
          if (this.brokerConn.connected) {
            this.status({
              fill: 'green',
              shape: 'dot',
              text: 'node-red:common.status.connected'
            });
          }
        }
      });
    } else {
      this.error(RED._('indySoft.mqtt.errors.missing-config'));
    }
  }
  RED.nodes.registerType(NODE_TYPE, nodeConstructor);
};