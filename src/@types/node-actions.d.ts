interface ResetOptions {
  section: string;
  action: string;
}

interface TriggerOptions {
  type: string;
  sessionId: string;
  runId: string;
  section: string;
  action: string;
}

interface ResetResult extends ResetOptions {
  error?: string;
  message?: string;
}

interface TriggerResult extends TriggerOptions {
  error?: string;
  message?: string;
}
