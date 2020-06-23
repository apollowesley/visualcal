import 'module-alias/register';
import { NodeProperties } from 'node-red';
import { NodeRedRuntimeNode, NodeRed, NodeRedNodeMessage, NodeRedNodeSendFunction, NodeRedNodeDoneFunction } from '../types/logic-server';

export const NODE_TYPE = 'indysoft-command-sequence-builder';

export interface RuntimeProperties extends NodeProperties {
  respondInBulk: string;
  operations: InterfaceOperation[];
}

export interface RuntimeNode extends NodeRedRuntimeNode {
  respondInBulk: boolean;
  operations: InterfaceOperation[];
}

function validateOperation(operation: InterfaceOperation, node: RuntimeNode) {
  let isValid = true;
  const msgOperation: InterfaceOperation = {
    respondInBulk: operation.respondInBulk,
    type: operation.type
  };
  switch (operation.type) {
    case 'command':
      msgOperation.commandType = operation.commandType;
      msgOperation.unitId = operation.unitId;
      if (!operation.unitId) {
        isValid = false;
        node.error('Command missing unit Id');
      }
      if (operation.commandType === 'read' || operation.commandType === 'query') {
        msgOperation.unitId = operation.unitId;
        msgOperation.readLength = operation.readLength;
        msgOperation.useReadLength = operation.useReadLength;
        msgOperation.responseTag = operation.responseTag;
        msgOperation.readDataType = operation.readDataType;
        if (!operation.readDataType) {
          isValid = false;
          node.error('Read or Query command missing response type');
        }
        if (operation.useReadLength && (!operation.readLength || operation.readLength <= 0)) {
          isValid = false;
          node.error('Read or Query command using length, but requested length is less than or equal to zero');
        }
        if (!operation.responseTag) {
          isValid = false;
          node.error('Read or Query command missing response tag');
        }
      }
      if (operation.commandType === 'write' || operation.commandType === 'query') {
        msgOperation.writeData = operation.writeData;
        if (!operation.writeData) {
          isValid = false;
          node.error('Read or Query command missing write data');
        }
      }
      break;
    case 'delay':
      msgOperation.delay = operation.delay;
      if (!operation.delay || operation.delay <= 0) {
        isValid = false;
        node.error('Delay is less than or equal to zero');
      }
      break;
    case 'reset':
      msgOperation.resetType = operation.resetType;
      if (!operation.resetType) {
        isValid = false;
        node.error('Reset missing type');
      } else {
        switch (operation.resetType) {
          case 'device':
            msgOperation.unitId = operation.unitId;
            if (!operation.unitId) {
              isValid = false;
              node.error('Reset missing unit Id');
            }
            break;
          case 'interface':
            msgOperation.interfaceId = operation.interfaceId;
            if (!operation.interfaceId) {
              isValid = false;
              node.error('Reset missing interface Id');
            }
            break;
          default:
            isValid = false;
            node.error('Invalid reset type');
        }
      }
      break;
    case 'trigger':
      msgOperation.unitId = operation.unitId;
      if (!operation.unitId) {
        isValid = false;
        node.error('Trigger missing unit Id');
      }
      break;
    default:
      isValid = false;
      node.error('Invalid operation type');
  }
  return {
    isValid,
    msgOperation
  };
}

module.exports = (RED: NodeRed) => {
  function nodeConstructor(this: RuntimeNode, config: RuntimeProperties) {
    RED.nodes.createNode(this, config);
    this.respondInBulk = !!config.respondInBulk;
    this.operations = config.operations;
    if (!this.operations) {
      this.error('Missing operations');
      return;
    }
    this.on('input', (msg: NodeRedNodeMessage, send: NodeRedNodeSendFunction, done?: NodeRedNodeDoneFunction) => {
      let isValid = true;
      const msgOperations: InterfaceOperation[] = [];
      this.operations.forEach(operation => {
        const result = validateOperation(operation, this);
        if (!result.isValid) isValid = false;
        msgOperations.push(result.msgOperation);
      });
      if (isValid) {
        msg.payload = {
          respondInBulk: this.respondInBulk,
          operations: msgOperations
        };
        send(msg);
      }
      if (done) done();
    });
  }
  RED.nodes.registerType(NODE_TYPE, nodeConstructor);
};
