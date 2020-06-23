export interface ResetOptions {
  section: string;
  action: string;
}

export interface TriggerOptions {
  type: string;
  sessionId: string;
  runId: string;
  section: string;
  action: string;
}

export interface ResetResult extends ResetOptions {
  error?: string;
  message?: string;
}

export interface TriggerResult extends TriggerOptions {
  error?: string;
  message?: string;
}
