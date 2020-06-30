import { ActionStartRuntimeNode } from '../../../@types/logic-server';

export const trigger = (options: TriggerOptions): TriggerResult => {
  const { type, section, action } = options;
  const response: TriggerResult = {
    type: type.toLowerCase(),
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
    response.error = 'Unable to find action start node';
  }
  return response;
};
