import { Instruction, InstructionSet } from 'visualcal-common/src/driver-builder';

export interface ItemInstruction extends Instruction {
  id: string;
  file?: string;
  instructionSet?: InstructionSet;
}

export interface Item {
  id: string;
  name: string;
  children?: Item[] | ItemInstruction[];
  file?: string;
}
