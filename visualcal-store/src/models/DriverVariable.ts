import mongoose from 'mongoose';
import { DriverVariable as DriverVariableInterface, StoreDriverVariable } from 'visualcal-common/dist/driver-builder';

export const DriverVariableSchema = new mongoose.Schema<DriverVariableInterface>({
  name: { type: String, required: true },
  defaultValue: { type: mongoose.Schema.Types.Mixed, required: false }
});

export interface DriverVariableStatic extends mongoose.Model<StoreDriverVariable> {
  getAll(): Promise<StoreDriverVariable[]>;
  build(item: DriverVariableInterface): StoreDriverVariable;
  add(item: DriverVariableInterface): Promise<StoreDriverVariable>;
}

DriverVariableSchema.statics.build = (item: DriverVariableInterface) => {
  return new DriverVariable(item);
};

DriverVariableSchema.statics.getAll = async () => {
  return await DriverVariable.find().exec();
}

DriverVariableSchema.statics.add = async (item: DriverVariableInterface) => {
  const existing = await DriverVariable.findOne({ _id: item._id });
  if (existing) throw new Error('Command parameter list item already exists');
  const newItem = DriverVariable.build(item);
  return newItem.save();
}

export const DriverVariable = mongoose.model<StoreDriverVariable, DriverVariableStatic>('DriverVariable', DriverVariableSchema);
