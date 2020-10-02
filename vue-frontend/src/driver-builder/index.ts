type InstructionType = 'Read' | 'Write' | 'Query';
type DataType = 'Boolean' | 'Number' | 'String' | 'Binary';

// eslint-disable-next-line
export interface Instruction {
  name: string;
  description?: string;
  type: InstructionType;
  responseDataType?: DataType;
  readAttempts?: number;
  delayBefore?: number;
  delayAfter?: number;
  helpLink?: string;
  command: string;
  commandArgs?: string[];
}

export interface CustomInstruction extends Instruction {
  id: string;
  order: number;
}

export const IEEE4882MandatedCommands: Instruction[] = [
  { name: 'Clear Status Command', type: 'Write', command: '*CLS' },
  { name: 'Standard Event Status Enable Command', type: 'Write', command: '*ESE' },
  { name: 'Standard Event Status Enable Query', type: 'Query', command: '*ESE?', responseDataType: 'Number' },
  { name: 'Standard Event Status Register Query', type: 'Query', command: '*ESR?', responseDataType: 'Number' },
  { name: 'Identification Query', type: 'Query', command: '*IDN?', responseDataType: 'String' },
  { name: 'Operation Complete Command', type: 'Write', command: '*OPC' },
  { name: 'Operation Complete Query', type: 'Query', command: '*OPC?', responseDataType: 'Boolean' },
  { name: 'Reset Command', type: 'Write', command: '*RST' },
  { name: 'Service Request Enable Command', type: 'Write', command: '*SRE' },
  { name: 'Service Request Enable Query', type: 'Query', command: '*SRE?', responseDataType: 'Number' },
  { name: 'Read Status Byte Query', type: 'Query', command: '*STB?', responseDataType: 'Number' },
  { name: 'Self-Test Query', type: 'Query', command: '*TST?', responseDataType: 'Number' },
  { name: 'Wait-to-Continue Command', type: 'Write', command: '*WAI' }
];

export const SCPIRequiredCommands: Instruction[] = [
  { name: 'System Error Query', type: 'Query', command: 'SYSTem:ERRor?' },
  { name: 'System Version Query', type: 'Query', command: 'SYSTem:VERSion?' },
  { name: 'Status Operation Event Query', type: 'Query', command: 'STATus:OPERation:EVENt?' },
  { name: 'Status Operation Condition Query', type: 'Query', command: 'STATus:OPERation:CONDition?' },
  { name: 'Status Operation Enable Command', type: 'Write', command: 'STATus:OPERation:ENABle $reqArg1' },
  { name: 'Status Operation Enable Query', type: 'Query', command: 'STATus:OPERation:ENABle?' },
  { name: 'Status Questionable Event Query', type: 'Query', command: 'STATus:QUEStionable:EVENt?' },
  { name: 'Status Questionable Condition Query', type: 'Query', command: 'STATus:QUEStionable:CONDition?' },
  { name: 'Status Questionable Enable Command', type: 'Write', command: 'STATus:QUEStionable:ENABle $reqArg1' },
  { name: 'Status Questionable Enable Query', type: 'Query', command: 'STATus:QUEStionable:ENABle?' },
  { name: 'Status Preset Command', type: 'Write', command: 'STATus:PRESet' }
];

export const getRequiredCommandArgsCount = (instruction: Instruction) => {
  return (instruction.command.match(/\$reqArg*/g) || []).length;
}

export const getOptionalCommandArgsCount = (instruction: Instruction) => {
  return (instruction.command.match(/\$optArg*/g) || []).length;
}

export interface Driver {
  manufacturer: string;
  model: string;
  nomenclature: string;
  identifiable: boolean;
  identityQueryCommand: string;
  isGpib: boolean;
  terminator: string;
}
