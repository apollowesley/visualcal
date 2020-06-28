interface LogicResultPassedCallback {
  (): boolean;
}

interface LogicResult {
  sessionId: string;
  runId: string;
  section: string;
  action: string;
  type: string;
  description: string;
  timestamp: Date;
  baseQuantity?: string;
  derivedQuantity?: string;
  derivedQuantityPrefix?: string;
  inputLevel: number;
  minimum: number;
  maximum: number;
  // eslint-disable-next-line
  rawValue: any;
  measuredValue: number;
  passed: boolean;
}


interface LogicActionResult extends LogicAction {
  result: LogicResult;
}
