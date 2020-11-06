import { Request, Response } from 'express';
import { Driver, StoreDriver } from 'visualcal-common/dist/driver-builder';
import models from './models';

export const getAll = async (_: Request, res: Response) => {
  const drivers = await models.Driver.getAll();
  return res.json(drivers);
}

export const add = async (req: Request<unknown, unknown, Driver>, res: Response<StoreDriver | Error>) => {
  const bodyDriver = req.body;
  try {
    let driver = await models.Driver.findOne({ driverManufacturer: bodyDriver.manufacturer, driverModel: bodyDriver.model, driverNomenclature: bodyDriver.nomenclature });
    if (!driver) {
      driver = await models.Driver.create();
    }
    driver.driverManufacturer = bodyDriver.manufacturer;
    driver.driverModel = bodyDriver.manufacturer;
    driver.driverNomenclature = bodyDriver.nomenclature;
    driver.instructionSets = [];
    bodyDriver.instructionSets.forEach(is => {
      if (driver) {
        driver.instructionSets.push();
      }
    });
    const addedDriver = await models.Driver.add(driver);
    return res.json(addedDriver);
  } catch (error) {
    res.statusCode = 400;
    return res.send(error);
  }
}
