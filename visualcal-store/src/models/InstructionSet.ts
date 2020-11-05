import mongoose from 'mongoose';
import { StoreInstructionSet } from 'visualcal-common/dist/driver-builder';

const instructionSetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  instructions: [{ type: mongoose.Schema.Types.ObjectId, required: true }]
});

export interface InstructionSetStatic extends mongoose.Model<StoreInstructionSet> {
  getAll(): Promise<StoreInstructionSet[]>;
  build(driver: StoreInstructionSet): StoreInstructionSet;
  add(driver: StoreInstructionSet): Promise<StoreInstructionSet>;
}

instructionSetSchema.statics.build = (instructionSet: StoreInstructionSet) => {
  return new InstructionSet(instructionSet);
};

instructionSetSchema.statics.getAll = async () => {
  return await InstructionSet.find().exec();
}

instructionSetSchema.statics.add = async (instructionSet: StoreInstructionSet) => {
  const existing = await InstructionSet.findOne({ _id: instructionSet._id });
  if (existing) throw new Error('Instruction set already exists');
  const newItem = InstructionSet.build(instructionSet);
  return newItem.save();
}

export const InstructionSet = mongoose.model<StoreInstructionSet, InstructionSetStatic>('InstructionSet', instructionSetSchema);
