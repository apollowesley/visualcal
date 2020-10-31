export const IpcChannels = {
  getAllBasicInfosForCurrentSession: {
    request: 'getAllBasicInfosForCurrentSession-runs-request',
    response: 'getAllBasicInfosForCurrentSession-runs-response',
    error: 'getAllBasicInfosForCurrentSession-runs-error'
  },
  getResultsForRun: {
    request: 'getResultsForRun-request',
    response: 'getResultsForRun-response',
    error: 'getResultsForRun-error'
  },
  runStarted: 'run-started',
  runStopped: 'run-stopped',
  resultAdded: 'run-result-added'
}

export interface Measurement<TRaw> {
  raw: TRaw;
}

export interface NumericMeasurement<TRaw, TValue> extends Measurement<TRaw> {
  raw: TRaw;
  value: TValue;
}

export interface LogicResultPassedCallback {
  (): boolean;
}

interface LogicAction {
  type: string;
  source: string;
  section: string;
  action: string;
}

export interface LogicResult<TRaw, TValue> {
  id: string;
  runId: string;
  type: string;
  description: string;
  timestamp: Date;
  baseQuantity?: string;
  derivedQuantity?: string;
  derivedQuantityPrefix?: string;
  minimum: number;
  maximum: number;
  inputLevel: TValue;
  rawValue: TRaw;
  measuredValue: TValue;
  passed: boolean;
}

interface Note {
  id: string;
  enteredBy: string;
  comment: string;
}

export interface LogicRunBasicInfo {
  id: string;
  sessionId: string;
  sectionId: string;
  actionId: string;
  startTimestamp: Date;
  stopTimestamp?: Date;
  description: string;
  isCompleted?: boolean;
  notes?: Note[];
}

export interface CommInterfaceLogEntry {
  id?: string;
  timestamp?: Date,
  interfaceName: string;
  message: string;
  error?: Error | string;
  data?: ArrayBuffer | string | number;
  deviceName?: string;
}

export interface LogicRun<TRaw, TValue> extends LogicRunBasicInfo {
  results: LogicResult<TRaw, TValue>[];
  communicationLogEntries?: CommInterfaceLogEntry[];
}
