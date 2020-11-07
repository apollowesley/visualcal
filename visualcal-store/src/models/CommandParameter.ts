import mongoose from 'mongoose';
import { CommandParameter as CommandParameterInterface, StoreCommandParameter } from 'visualcal-common/dist/driver-builder';
import { CommandParameterListItemSchema } from './CommandParameterListItem';

export const CommandParameterSchema = new mongoose.Schema<CommandParameterInterface>({
  type: { type: String, required: true },
  prompt: { type: String, required: true },
  beforeText: { type: String, required: false },
  afterText: { type: String, required: false },
  required: { type: Boolean, required: false },
  trueValue: { type: String, required: false },
  falseValue: { type: String, required: false },
  useMin: { type: Boolean, required: false },
  useMax: { type: Boolean, required: false },
  min: { type: Number, required: false },
  max: { type: Number, required: false },
  useMinMaxIncrement: { type: Boolean, required: false },
  minMaxIncrement: { type: Number, required: false },
  default: { type: mongoose.Schema.Types.Mixed, required: false },
  listItems: [{ type: CommandParameterListItemSchema, required: false }]
});

export interface CommandParameterStatic extends mongoose.Model<StoreCommandParameter> {
  getAll(): Promise<StoreCommandParameter[]>;
  build(driver: CommandParameterInterface): StoreCommandParameter;
  add(driver: CommandParameterInterface): Promise<StoreCommandParameter>;
}

CommandParameterSchema.statics.build = (parameter: CommandParameterInterface) => {
  return new CommandParameter(parameter);
};

CommandParameterSchema.statics.getAll = async () => {
  return await CommandParameter.find().exec();
}

CommandParameterSchema.statics.add = async (parameter: CommandParameterInterface) => {
  const existing = await CommandParameter.findOne({ _id: parameter._id });
  if (existing) throw new Error('Command parameter already exists');
  const newItem = CommandParameter.build(parameter);
  return newItem.save();
}

export const CommandParameter = mongoose.model<StoreCommandParameter, CommandParameterStatic>('CommandParameter', CommandParameterSchema);
