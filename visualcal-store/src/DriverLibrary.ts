import { Request, Response } from 'express';
import { StoreMongooseDriver } from 'visualcal-common/dist/driver-builder';
import { Driver } from './models/driver';

export const getAll = async (_: Request, res: Response) => {
  const drivers = await Driver.getAll();
  return res.json(drivers);
}

export const add = async (req: Request, res: Response) => {
  const bodyDriver = req.body as StoreMongooseDriver;
  try {
    const addedDriver = await Driver.add(bodyDriver);
    return res.json(addedDriver);
  } catch (error) {
    res.statusCode = 400;
    return res.send(error);
  }
}
