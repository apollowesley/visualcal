interface Result {
  timestamp: Date;
  source: string;
}

interface LogicResult extends Result {
  unitId: string;
  min: number;
  max: number;
  value: number;
  pass: boolean;
}

interface LogicResultMessage extends LoggerMessage {
  message: LogicResult
}

interface LogicResultTableItem {
  level: string;
  unitId: string;
  value: number;
  timestamp: Date;
  source: string;
}
