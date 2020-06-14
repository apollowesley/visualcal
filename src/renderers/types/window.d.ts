interface LoggerMessage {
  level: string;
}

interface Result {
  timestamp: Date;
  source: string;
}

interface LogicResult extends Result {
  unitId: string;
  value: number;
}

interface LogicResultMessage extends LoggerMessage {
  message: LogicResult
}

interface LogicResultTableItem extends LogicResult {
  level: string;
}

interface Window {
  moment: typeof import('moment'),
  visualCal: {
    log: {
      result(result: LogicResult): void;
    }
  }
}
