import mongoose from 'mongoose';

export const generateUuid = () => {
  return mongoose.Types.ObjectId().toHexString();
}
