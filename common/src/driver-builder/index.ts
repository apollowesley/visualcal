import mongoose from 'mongoose';

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
    getDriver: {
      request: 'driver-builder-get-driver-request',
      response: 'driver-builder-get-driver-response',
      error: 'driver-builder-get-driver-error'
    },
    getDriverIdentityInfos: {
      request: 'driver-builder-get-driver-identity-infos-request',
      response: 'driver-builder-get-driver-identity-infos-response',
      error: 'driver-builder-get-driver-identity-infos-error'
    },
    getDriverCategories: {
      request: 'driver-builder-get-driver-categories--request',
      response: 'driver-builder-get-driver-categories--request',
      error: 'driver-builder-get-driver-categories--request'
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

export type InstructionType = 'Read' | 'Write' | 'Query' | 'setVariable';
export type DataType = 'Boolean' | 'Number' | 'String' | 'Binary';
export type InstructionParameterType = 'boolean' | 'number' | 'string' | 'list' | 'readResponse' | 'variable';
export type CommandParameterType = 'pre' | 'post';

export interface DriverCategory {
  _id: string;
  name: string;
  instructionSets: string[];
}

export interface Library {
  drivers: Driver[];
  instructionSets: InstructionSet[];
  instructions: Instruction[];
  categories: DriverCategory[];
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

/** An item for a command parameter when its type is set to "list" */
export interface CommandParameterListItem {
  _id: string;
  text: string;
  value: string;
}

/** Represents a text segment of a command (i.e. the main body of the command or an parameter).  The final command will be assembled from these parts.  Note that the main part must exist, and only one main part can exist. */
export interface CommandParameter {
  _id: string;
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
  /** When this parameter's type is set to list, these are the items that will be used for the options available to the user. */
  listItems?: CommandParameterListItem[];
  /** When this parameter's type is set to boolean, this is the value that will be combined with the command when the argument is true. */
  trueValue?: string;
  /** When this parameter's type is set to boolean, this is the value that will be combined with the command when the argument is false. */
  falseValue?: string;
  /** Whether or not to force a minimum value when the parameter's type is set to number. */
  useMin?: boolean;
  /** Whether or not to force a maximum value when the parameter's type is set to number. */
  useMax?: boolean;
  /** When this parameter's type is set to number, this is the value that will be the minimum number allowed for input. */
  min?: number;
  /** When this parameter's type is set to number, this is the value that will be the maximum number allowed for input. */
  max?: number;
  /** Whether or not to use the increment. */
  useMinMaxIncrement?: boolean;
  /** The increment allowed between min and max. */
  minMaxIncrement?: number;
  /** The optional default value. */
  default?: string | number | boolean;
  /** The optional read response tag used as this parameters value */
  readResponseTag?: string;
  /** The optional variable used as this parameters value */
  variableName?: string;
}

/** A CommandParameter argument that will be sent along with the command to the device. */
export interface CommandParameterArgument {
  parameter: CommandParameter;
  value: string | boolean | number;
}

/** An instruction, or command, that is sent to a device during a write or query.  The Instruction interface is intended for use with command templates.  See CustomInstruction for use when implementing the actual command in the builder. */
export interface Instruction {
  _id: string;
  /** The position this instruction exists in an InstructionSet. */
  order?: number;
  /** The name for this instruction.  This helps differentiate one instruction from another when used in the same instruction set. */
  name: string;
  description?: string;
  /** The instruction type.  This determines if we are only writing data to the device, reading from the device, or both. */
  type: InstructionType;
  /** Expected data type returned from a read or query. */
  responseDataType?: DataType;
  /** Number of failed reads before throwing an error. */
  readAttempts?: number;
  /** Name used to tag the response from a read or query, to be used by other instructions that follow this one. */
  responseName?: string;
  /** Length of time, in milliseconds, to delay before invoking this instruction. */
  delayBefore?: number;
  /** Length of time, in milliseconds, to delay after invoking this instruction. */
  delayAfter?: number;
  /** A URI/URL of a help document or webpage that contains information about this instruction. */
  helpUri?: string;
  /** The command that is sent to the device, without parameters. */
  command: string;
  /** The optional pre-command parameters that are sent along with the command.  Parameters help define how the node UI is generated and presented to the procedure developer. */
  preParameters?: CommandParameter[];
  /** The optional post-command parameters that are sent along with the command.  Parameters help define how the node UI is generated and presented to the procedure developer. */
  postParameters?: CommandParameter[];
}

/** Instructions mandated by IEEE 488.2 and SCPI */
export const IEEE4882MandatedCommands: Instruction[] = [
  { _id: '524afd49-7a68-47aa-8f30-3ad68c3466f0', name: 'Clear Status Command', type: 'Write', command: '*CLS' },
  { _id: 'b345a42a-1661-42a4-acd8-6a1e6f9d17f7', name: 'Standard Event Status Enable Command', type: 'Write', command: '*ESE', postParameters: [{ _id: '0be8ab1e-a8fe-4a9b-a9e0-70131d7998de', type: 'number', prompt: 'Event status value?', beforeText: ' ' }] },
  { _id: '96b52d35-b46b-4e5e-94ad-49ebaae34b5e', name: 'Standard Event Status Enable Query', type: 'Query', command: '*ESE?', responseDataType: 'Number' },
  { _id: '61b8b79a-1b18-47e6-b2de-93772c7562da', name: 'Standard Event Status Register Query', type: 'Query', command: '*ESR?', responseDataType: 'Number' },
  { _id: '4caa1e38-6641-4781-b63b-e303b24577c6', name: 'Identification Query', type: 'Query', command: '*IDN?', responseDataType: 'String' },
  { _id: '5a7821d5-bcad-44fe-958d-e5edcc90ee6d', name: 'Operation Complete Command', type: 'Write', command: '*OPC' },
  { _id: '6d37157d-53ac-49dd-b930-e51de3042d11', name: 'Operation Complete Query', type: 'Query', command: '*OPC?', responseDataType: 'Boolean' },
  { _id: '232934f6-5832-4f9b-99bd-93c316bd7ca6', name: 'Reset Command', type: 'Write', command: '*RST' },
  { _id: '750e25a6-c3b5-484d-8bc8-92c47ac62b85', name: 'Service Request Enable Command', type: 'Write', command: '*SRE', postParameters: [{ _id: '9f0f191d-1ad4-4628-833f-370611eb6ff2', type: 'number', prompt: 'Service enable value?', beforeText: ' ' }] },
  { _id: 'e6bc632a-864f-4d7e-a64d-b2abbb5cd46e', name: 'Service Request Enable Query', type: 'Query', command: '*SRE?', responseDataType: 'Number' },
  { _id: 'a3be687b-56f4-415f-8751-d346d85f0a4c', name: 'Read Status Byte Query', type: 'Query', command: '*STB?', responseDataType: 'Number' },
  { _id: 'e6e36956-d36b-47e0-99d2-07f5f8c3c48c', name: 'Self-Test Query', type: 'Query', command: '*TST?', responseDataType: 'Number' },
  { _id: 'f7019a3c-d33c-4007-afcd-5abadd9bd3a4', name: 'Wait-to-Continue Command', type: 'Write', command: '*WAI' }
];

/** Instructions required by SCPI */
export const SCPIRequiredCommands: Instruction[] = [
  { _id: 'faa3d671-213a-4e21-82f4-5c60644be34a', name: 'System Error Query', type: 'Query', command: 'SYSTem:ERRor?', responseDataType: 'String' },
  { _id: 'b3a43737-1968-4b69-8532-2adbaabb7ea4', name: 'System Version Query', type: 'Query', command: 'SYSTem:VERSion?', responseDataType: 'String' },
  { _id: 'aed334e4-9fcd-4b08-bac6-7e1e0f193761', name: 'Status Operation Event Query', type: 'Query', command: 'STATus:OPERation:EVENt?', responseDataType: 'Number' },
  { _id: '85cdcc7a-f3fc-435f-98b2-5db8cab00f5c', name: 'Status Operation Condition Query', type: 'Query', command: 'STATus:OPERation:CONDition?', responseDataType: 'Number' },
  { _id: 'cce0e9b2-340b-4b60-b1af-5b1efa6582a6', name: 'Status Operation Enable Command', type: 'Write', command: 'STATus:OPERation:ENABle', postParameters: [{ _id: '72663b5a-3035-4a55-9142-4004af9ec4cf', type: 'number', prompt: 'Operation status value?', beforeText: ' ' }] },
  { _id: '6f41f82a-94cc-4530-bc9a-7fdfbf3dff08', name: 'Status Operation Enable Query', type: 'Query', command: 'STATus:OPERation:ENABle?', responseDataType: 'Number' },
  { _id: '76569773-162a-4021-baee-e8ea6d2d5fd8', name: 'Status Questionable Event Query', type: 'Query', command: 'STATus:QUEStionable:EVENt?', responseDataType: 'Number' },
  { _id: '263b4eeb-5f3e-42c7-bdda-602ce36253ee', name: 'Status Questionable Condition Query', type: 'Query', command: 'STATus:QUEStionable:CONDition?', responseDataType: 'Number' },
  { _id: 'e8df7e5a-0b4b-49ab-a7b0-f5a9dd3da3a3', name: 'Status Questionable Enable Command', type: 'Write', command: 'STATus:QUEStionable:ENABle', postParameters: [{ _id: 'ae1a7724-0b60-4326-93dd-5121fd29d4f1', type: 'number', prompt: 'Questionable status value?', beforeText: ' ' }] },
  { _id: 'a2174281-7a9e-41b4-97ec-01da025a291c', name: 'Status Questionable Enable Query', type: 'Query', command: 'STATus:QUEStionable:ENABle?', responseDataType: 'Number' },
  { _id: 'be4fd43b-5149-40fa-86ad-cb30b4d48fa1', name: 'Status Preset Command', type: 'Write', command: 'STATus:PRESet' }
];

export interface InstructionSet {
  _id: string;
  name: string;
  instructions: Instruction[];
}

export interface DriverVariable {
  _id: string;
  name: string;
  defaultValue: string;
}

export interface Driver {
  driverManufacturer: string;
  driverModel: string;
  driverNomenclature: string;
  identityQueryCommand?: string;
  terminator: string;
  isGPIB?: boolean;
  isIEEE4882?: boolean;
  isSCPI?: boolean;
  instructionSets: InstructionSet[],
  categories?: string[];
  variables?: DriverVariable[];
}

export type StoreDriver = Driver & mongoose.Document;
export type StoreInstructionSet = InstructionSet & mongoose.Document;
export type StoreInstruction = Instruction & mongoose.Document;
export type StoreCommandParameter = CommandParameter & mongoose.Document;
export type StoreCommandParameterListItem = CommandParameterListItem & mongoose.Document;
export type StoreDriverCategory = DriverCategory & mongoose.Document;
export type StoreDriverVariable = DriverVariable & mongoose.Document;

export const STORE_UPDATED = 'STORE-UPDATED';