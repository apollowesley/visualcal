import mongoose from 'mongoose';
import { DataType, InstructionParameterType, InstructionType } from './common';
/** An item for a command parameter when its type is set to "list" */
export interface StoreCommandParameterListItem extends mongoose.Document {
    text: string;
    value: string;
}
export interface StoreCommandParameter extends mongoose.Document {
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
    listItems?: StoreCommandParameterListItem[];
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
export interface StoreInstruction extends mongoose.Document {
    name: string;
    /** The position this instruction exists in an InstructionSet. */
    order?: number;
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
    parameters?: StoreCommandParameter[];
}
export interface StoreInstructionSet extends mongoose.Document {
    name: string;
    instructions: StoreInstruction[];
}
export interface StoreDriver extends mongoose.Document {
    driverManufacturer: string;
    driverModel: string;
    driverNomenclature: string;
    instructionSets: StoreInstructionSet[];
}
