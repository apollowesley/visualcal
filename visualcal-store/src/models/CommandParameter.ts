import mongoose from 'mongoose';
import { StoreCommandParameter } from 'visualcal-common/dist/driver-builder';

const commandParameterSchema = new mongoose.Schema({
  type: { type: String, required: true },
  prompt: { type: String, required: true },
  beforeText: { type: String, required: false },
  afterText: { type: String, required: false },
  required: { type: Boolean, required: false },
  listItems: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
  trueValue: { type: String, required: false },
  falseValue: { type: String, required: false },
  useMin: { type: Boolean, required: false },
  useMax: { type: Boolean, required: false },
  min: { type: Number, required: false },
  max: { type: Number, required: false },
  useMinMaxIncrement: { type: Boolean, required: false },
  minMaxIncrement: { type: Number, required: false },
  default: { type: mongoose.Schema.Types.Mixed, required: false }
});

export interface CommandParameterStatic extends mongoose.Model<StoreCommandParameter> {
  getAll(): Promise<StoreCommandParameter[]>;
  build(driver: StoreCommandParameter): StoreCommandParameter;
  add(driver: StoreCommandParameter): Promise<StoreCommandParameter>;
}

commandParameterSchema.statics.build = (parameter: StoreCommandParameter) => {
  return new CommandParameter(parameter);
};

commandParameterSchema.statics.getAll = async () => {
  return await CommandParameter.find().exec();
}

commandParameterSchema.statics.add = async (parameter: StoreCommandParameter) => {
  const existing = await CommandParameter.findOne({ _id: parameter._id });
  if (existing) throw new Error('Command parameter already exists');
  const newItem = CommandParameter.build(parameter);
  return newItem.save();
}

export const CommandParameter = mongoose.model<StoreCommandParameter, CommandParameterStatic>('CommandParameter', commandParameterSchema);
