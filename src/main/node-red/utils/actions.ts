import { ActionStartRuntimeNode } from '../../../@types/logic-server';
import { resetAllNodes, loadCommunicationConfiguration } from '.';

export type TriggerType = 'start' | 'stop' | 'reset';

export interface ResetOptions {
  section: string;
  action: string;
}

export interface ResetResult extends ResetOptions {
  error?: string;
  message?: string;
}

export interface TriggerOptions {
  type: TriggerType;
  sessionId: string;
  runId: string;
  section: string;
  action: string;
  session?: Session;
}

export interface TriggerResult extends TriggerOptions {
  error?: string;
  message?: string;
}

export const trigger = (options: TriggerOptions): TriggerResult => {
  const { type, section, action, session } = options;
  const response: TriggerResult = {
    type: type,
    sessionId: options.sessionId,
    runId: options.runId,
    section: section.toLowerCase(),
    action: action.toLowerCase()
  };
  const startNode = (global.visualCal.nodeRed.app.settings.findNodesByType('indysoft-action-start') as ActionStartRuntimeNode[]).find(n => n.section && n.section.shortName.toLowerCase() === response.section && n.name.toLowerCase() === response.action);
  if (startNode) {
    if (type === 'start') {
      if (startNode.isRunning) {
        response.error = 'Already running';
      } else {
        if (session) {
          loadCommunicationConfiguration(session);
        }
        startNode.emit('start', options);
        response.message = 'ok';
      }
    } else if (type === 'stop') {
      startNode.emit('stop');
      response.message = 'ok';
    } else if (type === 'reset') {
      startNode.emit('stop');
      startNode.emit('reset');
      response.message = 'ok';
    }
  } else {
    if (type === 'reset') {
      resetAllNodes();
    }
    // response.error = 'Unable to find action start node';
  }
  return response;
};
