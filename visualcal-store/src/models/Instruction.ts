import mongoose from 'mongoose';
import { StoreInstruction } from 'visualcal-common/dist/driver-builder';

const instructionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  type: { type: String, required: true },
  responseDataType: { type: String, required: false },
  readAttempts: { type: Number, required: false },
  delayBefore: { type: Number, required: false },
  delayAfter: { type: Number, required: false },
  helpUri: { type: String, required: false },
  command: { type: String, required: true },
  parameters: [{ type: mongoose.Schema.Types.ObjectId, required: true }]
});

export interface InstructionStatic extends mongoose.Model<StoreInstruction> {
  getAll(): Promise<StoreInstruction[]>;
  build(driver: StoreInstruction): StoreInstruction;
  add(driver: StoreInstruction): Promise<StoreInstruction>;
}

instructionSchema.statics.build = (instruction: StoreInstruction) => {
  return new Instruction(instruction);
};

instructionSchema.statics.getAll = async () => {
  return await Instruction.find().exec();
}

instructionSchema.statics.add = async (instruction: StoreInstruction) => {
  const existing = await Instruction.findOne({ _id: instruction._id });
  if (existing) throw new Error('Instruction already exists');
  const newItem = Instruction.build(instruction);
  return newItem.save();
}

export const Instruction = mongoose.model<StoreInstruction, InstructionStatic>('Instruction', instructionSchema);
