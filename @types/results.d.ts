interface Result {
  timestamp: Date;
  source: string;
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
