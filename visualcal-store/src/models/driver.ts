import mongoose from 'mongoose';
import { StoreDriver } from 'visualcal-common/dist/driver-builder';

const driverSchema = new mongoose.Schema({
  driverManufacturer: { type: String, required: true },
  driverModel: { type: String, required: true },
  driverNomenclature: { type: String, required: true },
  identityQueryCommand: { type: String, required: false },
  terminator: { type: String, required: true },
  instructionSets: [{ type: mongoose.Schema.Types.ObjectId, required: true }]
});

export interface DriverStatic extends mongoose.Model<StoreDriver> {
  getAll(): Promise<StoreDriver[]>;
  build(driver: StoreDriver): StoreDriver;
  add(driver: StoreDriver): Promise<StoreDriver>;
}

driverSchema.statics.build = (driver: StoreDriver) => {
  return new Driver(driver);
};

driverSchema.statics.getAll = async () => {
  return await Driver.find().exec();
}

driverSchema.statics.add = async (driver: StoreDriver) => {
  const existing = await Driver.findOne({ _id: driver._id });
  if (existing) throw new Error('Driver already exists');
  const newItem = Driver.build(driver);
  return newItem.save();
}

export const Driver = mongoose.model<StoreDriver, DriverStatic>('Driver', driverSchema);
