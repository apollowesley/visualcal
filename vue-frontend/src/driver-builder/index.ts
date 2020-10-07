type InstructionType = 'Read' | 'Write' | 'Query';
type DataType = 'Boolean' | 'Number' | 'String' | 'Binary';
type InstructionCommandPartType = 'main' | 'parameter';

/** Represents a text segment of a command (i.e. the main body of the command or an parameter).  The final command will be assembled from these parts.  Note that the main part must exist, and only one main part can exist. */
interface InstructionCommandPart {
  type: InstructionCommandPartType;
  /** The text of the this part. */
  text: string;
  /** Characters to be appended to the text property.  This is intented to be used for separating parameters from the main part and from other parameters. */
  afterText?: string;
  /** Whether or not this part is required.  Only used if type is parameter. */
  required?: boolean;
}

/** An instruction, or command, that is sent to a device during a write or query.  The Instruction interface is intended for use with command templates.  See CustomInstruction for use when implementing the actual command in the builder. */
export interface Instruction {
  name: string;
  description?: string;
  type: InstructionType;
  /** Expected data type returned from a read or query. */
  responseDataType?: DataType;
  /** Number of failed reads before throwing an error. */
  readAttempts?: number;
  /** Length of time, in milliseconds, to delay before invoking this instruction. */
  delayBefore?: number;
  /** Length of time, in milliseconds, to delay after invoking this instruction. */
  delayAfter?: number;
  /** A URI/URL of a help document or webpage that contains information about this instruction. */
  helpUri?: string;
  /** The command that is sent to the device.  Can be a string or an array of InstructionCommandPart that make up the complete command.  At a minimum one, and only one, part with type "main" can and must exist if using an array of InstructionCommandPart. */
  command: string | InstructionCommandPart[];
}

/** Extended instruction with tracking information for use with custom commands. */
export interface CustomInstruction extends Instruction {
  id: string;
  order: number;
}

/** Instructions mandated by IEEE 488.2 and SCPI */
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

/** Instructions required by SCPI */
export const SCPIRequiredCommands: Instruction[] = [
  { name: 'System Error Query', type: 'Query', command: 'SYSTem:ERRor?', responseDataType: 'String' },
  { name: 'System Version Query', type: 'Query', command: 'SYSTem:VERSion?', responseDataType: 'String' },
  { name: 'Status Operation Event Query', type: 'Query', command: 'STATus:OPERation:EVENt?', responseDataType: 'Number' },
  { name: 'Status Operation Condition Query', type: 'Query', command: 'STATus:OPERation:CONDition?', responseDataType: 'Number' },
  { name: 'Status Operation Enable Command', type: 'Write', command: 'STATus:OPERation:ENABle $reqArg1' },
  { name: 'Status Operation Enable Query', type: 'Query', command: 'STATus:OPERation:ENABle?', responseDataType: 'Number' },
  { name: 'Status Questionable Event Query', type: 'Query', command: 'STATus:QUEStionable:EVENt?', responseDataType: 'Number' },
  { name: 'Status Questionable Condition Query', type: 'Query', command: 'STATus:QUEStionable:CONDition?', responseDataType: 'Number' },
  { name: 'Status Questionable Enable Command', type: 'Write', command: 'STATus:QUEStionable:ENABle $reqArg1' },
  { name: 'Status Questionable Enable Query', type: 'Query', command: 'STATus:QUEStionable:ENABle?', responseDataType: 'Number' },
  { name: 'Status Preset Command', type: 'Write', command: 'STATus:PRESet' }
];

const getInstructionCommandPartArgsCount = (commands: InstructionCommandPart[]) => {
  return commands.filter(c => c.type !== 'main').length;
}

export const getRequiredCommandArgsCount = (instruction: Instruction) => {
  if (typeof instruction.command === 'string') return (instruction.command.match(/\$reqArg*/g) || []).length;
  return getInstructionCommandPartArgsCount(instruction.command);
}

export const getOptionalCommandArgsCount = (instruction: Instruction) => {
  if (typeof instruction.command === 'string') return (instruction.command.match(/\$optArg*/g) || []).length;
  return getInstructionCommandPartArgsCount(instruction.command);
}

export interface DriverSection {
  name: string;
}

export interface Driver {
  manufacturer: string;
  model: string;
  nomenclature: string;
  identifiable: boolean;
  identityQueryCommand: string;
  isGpib: boolean;
  terminator: string;
  sections: DriverSection[]
}
