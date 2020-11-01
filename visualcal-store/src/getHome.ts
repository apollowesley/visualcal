import { Request, Response } from 'express';

export const getHome = (req: Request, res: Response) => {
  return res.send('<html><body><label>IndySoft VisualCal Store</label></body</html>');
}
