import mongoose from 'mongoose';
import { Instruction as InstructionInterface, StoreInstruction } from 'visualcal-common/dist/driver-builder';
import { CommandParameterSchema } from './CommandParameter';

export const InstructionSchema = new mongoose.Schema<InstructionInterface>({
  name: { type: String, required: true },
  description: { type: String, required: false },
  type: { type: String, required: true },
  responseDataType: { type: String, required: false },
  readAttempts: { type: Number, required: false },
  responseName: { type: String, required: false },
  delayBefore: { type: Number, required: false },
  delayAfter: { type: Number, required: false },
  helpUri: { type: String, required: false },
  command: { type: String, required: true },
  preParameters: [{ type: CommandParameterSchema, required: false }],
  postParameters: [{ type: CommandParameterSchema, required: false }]
});

export interface InstructionStatic extends mongoose.Model<StoreInstruction> {
  getAll(): Promise<StoreInstruction[]>;
  build(driver: InstructionInterface): StoreInstruction;
  add(driver: InstructionInterface): Promise<StoreInstruction>;
}

InstructionSchema.statics.build = (instruction: InstructionInterface) => {
  return new Instruction(instruction);
};

InstructionSchema.statics.getAll = async () => {
  return await Instruction.find().exec();
}

InstructionSchema.statics.add = async (instruction: InstructionInterface) => {
  const existing = await Instruction.findOne({ _id: instruction._id });
  if (existing) throw new Error('Instruction already exists');
  const newItem = Instruction.build(instruction);
  return newItem.save();
}

export const Instruction = mongoose.model<StoreInstruction, InstructionStatic>('Instruction', InstructionSchema);
