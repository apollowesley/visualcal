import mongoose from 'mongoose';
import { StoreCommandParameterListItem } from 'visualcal-common/dist/driver-builder';

const commandParameterListItemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  value: { type: String, required: true }
});

export interface CommandParameterListItemStatic extends mongoose.Model<StoreCommandParameterListItem> {
  getAll(): Promise<StoreCommandParameterListItem[]>;
  build(driver: StoreCommandParameterListItem): StoreCommandParameterListItem;
  add(driver: StoreCommandParameterListItem): Promise<StoreCommandParameterListItem>;
}

commandParameterListItemSchema.statics.build = (item: StoreCommandParameterListItem) => {
  return new CommandParameterListItem(item);
};

commandParameterListItemSchema.statics.getAll = async () => {
  return await CommandParameterListItem.find().exec();
}

commandParameterListItemSchema.statics.add = async (item: StoreCommandParameterListItem) => {
  const existing = await CommandParameterListItem.findOne({ _id: item._id });
  if (existing) throw new Error('Command parameter list item already exists');
  const newItem = CommandParameterListItem.build(item);
  return newItem.save();
}

export const CommandParameterListItem = mongoose.model<StoreCommandParameterListItem, CommandParameterListItemStatic>('CommandParameterListItem', commandParameterListItemSchema);
