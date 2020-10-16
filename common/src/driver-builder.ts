export const IpcChannels = {
  communicationInterface: {
    getLibrary: {
      request: 'driver-builder-get-library-request',
      response: 'driver-builder-get-library-response',
      error: 'driver-builder-get-library-error'
    },
    setLibrary: {
      request: 'driver-builder-set-library-request',
      response: 'driver-builder-set-library-response',
      error: 'driver-builder-set-library-error'
    },
    saveDriver: {
      request: 'driver-builder-save-driver-request',
      response: 'driver-builder-save-driver-response',
      error: 'driver-builder-save-driver-error'
    },
    getStatus: {
      request: 'driver-builder-get-status-request',
      response: 'driver-builder-get-status-response',
      error: 'driver-builder-get-status-error'
    },
    connect: {
      request: 'driver-builder-iface-connect-request',
      response: 'driver-builder-iface-connect-response',
      error: 'driver-builder-iface-connect-error'
    },
    disconnect: {
      request: 'driver-builder-iface-disconnect-request',
      response: 'driver-builder-iface-disconnect-response',
      error: 'driver-builder-iface-disconnect-error'
    },
    write: {
      request: 'driver-builder-iface-write-request',
      response: 'driver-builder-iface-write-response',
      error: 'driver-builder-iface-write-error'
    },
    read: {
      request: 'driver-builder-iface-read-request',
      response: 'driver-builder-iface-read-response',
      error: 'driver-builder-iface-read-error'
    },
    queryString: {
      request: 'driver-builder-iface-query-string-request',
      response: 'driver-builder-iface-query-string-response',
      error: 'driver-builder-iface-query-string-error'
    }
  }
}

export interface Library {
  drivers: Driver[];
  instructionSets: InstructionSet[];
  instructions: Instruction[];
}

export interface Status {
  communicationInterfaceName?: string;
  isConnected: boolean;
}

export interface CommunicationInterfaceActionInfo {
  deviceGpibAddress?: number;
  delayBefore?: number;
  delayAfter?: number;
  terminator?: string;
}

export interface WriteInfo extends CommunicationInterfaceActionInfo {
  data: ArrayBufferLike;
}

export interface QueryStringInfo extends CommunicationInterfaceActionInfo {
  data: string;
}

type InstructionType = 'Read' | 'Write' | 'Query';
type DataType = 'Boolean' | 'Number' | 'String' | 'Binary';
type InstructionParameterType = 'boolean' | 'number' | 'string' | 'list';

/** An item for a command parameter when its type is set to "list" */
export interface CommandParameterListItem {
  text: string;
  value: string;
}

/** Represents a text segment of a command (i.e. the main body of the command or an parameter).  The final command will be assembled from these parts.  Note that the main part must exist, and only one main part can exist. */
export interface CommandParameter {
  /** The parameter type.  This determines what is shown to the procedure developer when editing the node that represents it. */
  type: InstructionParameterType;
  /** The prompt to show the procedure developer for this parameter when editing the node that represents it. */
  prompt: string;
  /** Characters to be prepend to the text property.  This is intented to be used for separating parameters from the main part and from other parameters. */
  beforeText?: string;
  /** Characters to be appended to the text property.  This is intented to be used for separating parameters from the main part and from other parameters. */
  afterText?: string;
  /** Whether or not this part is required.  Only used if type is parameter. */
  required?: boolean;
  /** When this parameters type is set to list, these are the items that will be used for the options available to the user. */
  listItems?: CommandParameterListItem[];
}

/** A CommandParameter argument that will be sent along with the command to the device. */
export interface CommandParameterArgument {
  parameter: CommandParameter;
  value: string | boolean | number;
}

/** An instruction, or command, that is sent to a device during a write or query.  The Instruction interface is intended for use with command templates.  See CustomInstruction for use when implementing the actual command in the builder. */
export interface Instruction {
  /** The name for this instruction.  This helps differentiate one instruction from another when used in the same instruction set. */
  name: string;
  description?: string;
  /** The instruction type.  This determines if we are only writing data to the device, reading from the device, or both. */
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
  /** The command that is sent to the device, without parameters. */
  command: string;
  /** The optional command parameters that are sent along with the command.  Parameters help define how the node UI is generated and presented to the procedure developer. */
  parameters?: CommandParameter[];
}

/** Extended instruction with tracking information for use with custom commands. */
export interface CustomInstruction extends Instruction {
  id: string;
  order: number;
}

/** Instructions mandated by IEEE 488.2 and SCPI */
export const IEEE4882MandatedCommands: Instruction[] = [
  { name: 'Clear Status Command', type: 'Write', command: '*CLS' },
  { name: 'Standard Event Status Enable Command', type: 'Write', command: '*ESE', parameters: [{ type: 'number', prompt: 'Event status value?', beforeText: ' ' }] },
  { name: 'Standard Event Status Enable Query', type: 'Query', command: '*ESE?', responseDataType: 'Number' },
  { name: 'Standard Event Status Register Query', type: 'Query', command: '*ESR?', responseDataType: 'Number' },
  { name: 'Identification Query', type: 'Query', command: '*IDN?', responseDataType: 'String' },
  { name: 'Operation Complete Command', type: 'Write', command: '*OPC' },
  { name: 'Operation Complete Query', type: 'Query', command: '*OPC?', responseDataType: 'Boolean' },
  { name: 'Reset Command', type: 'Write', command: '*RST' },
  { name: 'Service Request Enable Command', type: 'Write', command: '*SRE', parameters: [{ type: 'number', prompt: 'Service enable value?', beforeText: ' ' }] },
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
  { name: 'Status Operation Enable Command', type: 'Write', command: 'STATus:OPERation:ENABle', parameters: [{ type: 'number', prompt: 'Operation status value?', beforeText: ' ' }] },
  { name: 'Status Operation Enable Query', type: 'Query', command: 'STATus:OPERation:ENABle?', responseDataType: 'Number' },
  { name: 'Status Questionable Event Query', type: 'Query', command: 'STATus:QUEStionable:EVENt?', responseDataType: 'Number' },
  { name: 'Status Questionable Condition Query', type: 'Query', command: 'STATus:QUEStionable:CONDition?', responseDataType: 'Number' },
  { name: 'Status Questionable Enable Command', type: 'Write', command: 'STATus:QUEStionable:ENABle', parameters: [{ type: 'number', prompt: 'Questionable status value?', beforeText: ' ' }] },
  { name: 'Status Questionable Enable Query', type: 'Query', command: 'STATus:QUEStionable:ENABle?', responseDataType: 'Number' },
  { name: 'Status Preset Command', type: 'Write', command: 'STATus:PRESet' }
];

export interface InstructionSet {
  id: string;
  name: string;
  instructions: CustomInstruction[];
}

export interface Driver {
  manufacturer: string;
  model: string;
  nomenclature: string;
  identityQueryCommand?: string;
  terminator: string;
  instructionSets: InstructionSet[]
}
