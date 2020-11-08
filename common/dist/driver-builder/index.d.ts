import mongoose from 'mongoose';
export declare const IpcChannels: {
    communicationInterface: {
        getLibrary: {
            request: string;
            response: string;
            error: string;
        };
        setLibrary: {
            request: string;
            response: string;
            error: string;
        };
        saveDriver: {
            request: string;
            response: string;
            error: string;
        };
        getDriver: {
            request: string;
            response: string;
            error: string;
        };
        getDriverIdentityInfos: {
            request: string;
            response: string;
            error: string;
        };
        getStatus: {
            request: string;
            response: string;
            error: string;
        };
        connect: {
            request: string;
            response: string;
            error: string;
        };
        disconnect: {
            request: string;
            response: string;
            error: string;
        };
        write: {
            request: string;
            response: string;
            error: string;
        };
        read: {
            request: string;
            response: string;
            error: string;
        };
        queryString: {
            request: string;
            response: string;
            error: string;
        };
    };
};
export declare type InstructionType = 'Read' | 'Write' | 'Query';
export declare type DataType = 'Boolean' | 'Number' | 'String' | 'Binary';
export declare type InstructionParameterType = 'boolean' | 'number' | 'string' | 'list';
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
/** Instructions mandated by IEEE 488.2 and SCPI */
export declare const IEEE4882MandatedCommands: Instruction[];
/** Instructions required by SCPI */
export declare const SCPIRequiredCommands: Instruction[];
export interface InstructionSet {
    _id: string;
    name: string;
    instructions: Instruction[];
}
export interface Driver {
    driverManufacturer: string;
    driverModel: string;
    driverNomenclature: string;
    identityQueryCommand?: string;
    terminator: string;
    instructionSets: InstructionSet[];
}
export declare type StoreDriver = Driver & mongoose.Document;
export declare type StoreInstructionSet = InstructionSet & mongoose.Document;
export declare type StoreInstruction = Instruction & mongoose.Document;
export declare type StoreCommandParameter = CommandParameter & mongoose.Document;
export declare type StoreCommandParameterListItem = CommandParameterListItem & mongoose.Document;
export declare const STORE_UPDATED = "STORE-UPDATED";
