import mongoose from 'mongoose';

export interface IDriver {
  driverManufacturer: string;
  driverModel: string;
  driverNomenclature: string;
}

interface DriverDoc extends mongoose.Document {
  driverManufacturer: string;
  driverModel: string;
  driverNomenclature: string;
}

interface DriverModelInterface extends mongoose.Model<DriverDoc> {
  getAll(): Promise<DriverDoc[]>;
  build(driver: IDriver): DriverDoc;
  add(driver: IDriver): Promise<DriverDoc>;
}

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  driverManufacturer: { type: String, required: true },
  driverModel: { type: String, required: true },
  driverNomenclature: { type: String, required: true }
});

driverSchema.statics.build = (driver: IDriver) => {
  return new Driver(driver);
};

driverSchema.statics.getAll = async () => {
  return await Driver.find().exec();
}

driverSchema.statics.add = async (driver: IDriver & mongoose.Document) => {
  const existing = await Driver.findOne({ _id: driver._id });
  if (existing) throw new Error('Driver already exists');
  const newDriver = Driver.build(driver);
  return newDriver.save();
}

const Driver = mongoose.model<DriverDoc, DriverModelInterface>('Driver', driverSchema);

export { Driver };
