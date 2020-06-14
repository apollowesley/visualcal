interface LoggerMessage {
  level: string;
}

interface Result extends LoggerMessage {
  timestamp: Date;
  source: string;
  message: string;
}

interface LogicResult extends Result {
  unitId: string;
  value: number;
}

interface Window {
  moment: typeof import('moment'),
  visualCal: {
    log: {
      result(result: LogicResult): void;
    }
  }
}
