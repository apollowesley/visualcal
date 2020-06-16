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

interface LogicResultTableItem {
  level: string;
  unitId: string;
  value: number;
  timestamp: Date;
  source: string;
}
