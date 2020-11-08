import { Request, Response } from 'express';
import { Driver, StoreDriver } from 'visualcal-common/dist/driver-builder';
import models from './models';
import { notifyStoreUpdated } from './SocketIo';

export const getAll = async (_: Request, res: Response) => {
  const drivers = await models.Driver.getAll();
  return res.json(drivers);
}

export const addOrUpdate = async (req: Request<unknown, unknown, Driver>, res: Response<StoreDriver | Error>) => {
  let bodyDriver = req.body;
  try {
    let driver = await models.Driver.findOne({ driverManufacturer: bodyDriver.driverManufacturer, driverModel: bodyDriver.driverModel, driverNomenclature: bodyDriver.driverNomenclature });
    if (!driver) {
      driver = await models.Driver.create(bodyDriver);
    } else {
      await driver.updateOne(bodyDriver);
    }
    driver = await driver.save();
    notifyStoreUpdated();
    return res.json(driver);
  } catch (error) {
    res.statusCode = 400;
    return res.send(error);
  }
}
