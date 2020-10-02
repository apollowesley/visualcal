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

export interface Driver {
  manufacturer: string;
  model: string;
  nomenclature: string;
  identifiable: boolean;
  identityQueryCommand: string;
  isGpib: boolean;
  terminator: string;
}
