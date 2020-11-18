import mongoose from 'mongoose';
import { Driver as DriverInterface, StoreDriver } from 'visualcal-common/dist/driver-builder';
import { DriverVariableSchema } from './DriverVariable';
import { InstructionSetSchema } from './InstructionSet';

const DriverSchema = new mongoose.Schema<DriverInterface>({
  driverManufacturer: { type: String, required: true },
  driverModel: { type: String, required: true },
  driverNomenclature: { type: String, required: true },
  identityQueryCommand: { type: String, required: false },
  terminator: { type: String, required: true },
  instructionSets: [{ type: InstructionSetSchema, required: true }],
  categories: { type: [String], required: false },
  variables: [{ type: DriverVariableSchema, required: false }]
});

export interface DriverStatic extends mongoose.Model<StoreDriver> {
  getAll(): Promise<StoreDriver[]>;
  build(driver: DriverInterface): StoreDriver;
  add(driver: DriverInterface): Promise<StoreDriver>;
}

DriverSchema.statics.build = (driver: DriverInterface) => {
  return new Driver(driver);
};

DriverSchema.statics.getAll = async () => {
  return await Driver.find().exec();
}

DriverSchema.statics.add = async (driver: DriverInterface) => {
  const existing = await Driver.findOne({ driverManufacturer: driver.driverManufacturer, driverModel: driver.driverModel, driverNomenclature: driver.driverNomenclature });
  if (existing) throw new Error('Driver already exists');
  const newItem = Driver.build(driver);
  return newItem.save();
}

export const Driver = mongoose.model<StoreDriver, DriverStatic>('Driver', DriverSchema);
