import { TypedEmitter } from 'tiny-typed-emitter';
import electronLog from 'electron-log';
import { NodeRedRuntimeNode } from '../../@types/logic-server';
import { dialog } from 'electron';

const log = electronLog.scope('NodeLogManager');

interface Events {
  debug: (node: NodeRedRuntimeNode, msg: string) => void;
  warn: (node: NodeRedRuntimeNode, msg: string) => void;
  error: (node: NodeRedRuntimeNode, error: Error) => void;
}

export class NodeLogManager extends TypedEmitter<Events> {

  private static fInstance = new NodeLogManager();
  static get instance() { return NodeLogManager.fInstance; }

  constructor() {
    super();
    log.info('Loaded');
  }

  debug(node: NodeRedRuntimeNode, msg: string) {
    this.emit('debug', node, msg);
  }

  warn(node: NodeRedRuntimeNode, msg: string) {
    this.emit('debug', node, msg);
    dialog.showErrorBox('An error occured', msg);
  }

  error(node: NodeRedRuntimeNode, error: Error) {
    this.emit('error', node, error);
    dialog.showErrorBox('An error occured', error.message);
  }

}
