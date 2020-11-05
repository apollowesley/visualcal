import { Request, Response } from 'express';
import { StoreDriver } from 'visualcal-common/dist/driver-builder';
import models from './models';

export const getAll = async (_: Request, res: Response) => {
  const drivers = await models.Driver.getAll();
  return res.json(drivers);
}

export const add = async (req: Request, res: Response) => {
  const bodyDriver = req.body as StoreDriver;
  try {
    const addedDriver = await models.Driver.add(bodyDriver);
    return res.json(addedDriver);
  } catch (error) {
    res.statusCode = 400;
    return res.send(error);
  }
}
