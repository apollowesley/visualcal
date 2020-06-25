declare type NotificationSource = 'logic';
declare type NotificationType = 'action' | 'result' | 'comment' | 'exception' | 'instruction';
declare type NotificationCommentType = 'info' | 'debug' | 'warning' | 'error';
declare type NotificationExceptionType = 'warning' | 'error' | 'critical';
declare type ActionState = 'started' | 'stopped' | 'completed';

interface NotifyFrontendActionOptions {
  type: NotificationType;
  sessionId: string;
  runId: string;
  section: string;
  action: string;
}

interface NotifyFrontendActionResultOptions extends NotifyFrontendActionOptions {
  result: LogicResult;
}

interface NotifiyFrontendActionStateChangeOptions extends NotifyFrontendActionOptions {
  state: ActionState;
}

interface NotifyFrontendShowInstructionOptions extends NotifyFrontendActionOptions {
  nodeId: string;
  title: string;
  text: string;
  showImage: boolean;
  imageSource?: 'asset' | 'url';
  asset?: string;
  url?: string;
}
