import mongoose from 'mongoose';
import { InstructionSet as InstructionSetInterface, StoreInstructionSet } from 'visualcal-common/dist/driver-builder';
import { InstructionSchema } from './Instruction';

export const InstructionSetSchema = new mongoose.Schema<InstructionSetInterface>({
  name: { type: String, required: true },
  instructions: [{ type: InstructionSchema, required: true }]
});

export interface InstructionSetStatic extends mongoose.Model<StoreInstructionSet> {
  getAll(): Promise<StoreInstructionSet[]>;
  build(driver: InstructionSetInterface): StoreInstructionSet;
  add(driver: InstructionSetInterface): Promise<StoreInstructionSet>;
}

InstructionSetSchema.statics.build = (instructionSet: InstructionSetInterface) => {
  return new InstructionSet(instructionSet);
};

InstructionSetSchema.statics.getAll = async () => {
  return await InstructionSet.find().exec();
}

InstructionSetSchema.statics.add = async (instructionSet: InstructionSetInterface) => {
  const existing = await InstructionSet.findOne({ _id: instructionSet._id });
  if (existing) throw new Error('Instruction set already exists');
  const newItem = InstructionSet.build(instructionSet);
  return newItem.save();
}

export const InstructionSet = mongoose.model<StoreInstructionSet, InstructionSetStatic>('InstructionSet', InstructionSetSchema);
