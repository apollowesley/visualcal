import mongoose from 'mongoose';
import { DriverCategory as DriverCategoryInterface, StoreDriverCategory } from 'visualcal-common/dist/driver-builder';

export const DriverCategorySchema = new mongoose.Schema<DriverCategoryInterface>({
  name: { type: String, required: true },
  instructionSets: { type: [String], required: true }
});

export interface DriverCategoryStatic extends mongoose.Model<StoreDriverCategory> {
  getAll(): Promise<StoreDriverCategory[]>;
  build(category: DriverCategoryInterface): StoreDriverCategory;
  add(category: DriverCategoryInterface): Promise<StoreDriverCategory>;
}

DriverCategorySchema.statics.build = (category: DriverCategoryInterface) => {
  return new DriverCategory(category);
};

DriverCategorySchema.statics.getAll = async () => {
  return await DriverCategory.find().exec();
}

DriverCategorySchema.statics.add = async (category: DriverCategoryInterface) => {
  const existing = await DriverCategory.findOne({ _id: category._id });
  if (existing) throw new Error('Driver category already exists');
  const newItem = DriverCategory.build(category);
  return newItem.save();
}

export const DriverCategory = mongoose.model<StoreDriverCategory, DriverCategoryStatic>('DriverCategory', DriverCategorySchema);
