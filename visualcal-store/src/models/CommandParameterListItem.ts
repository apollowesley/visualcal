import mongoose from 'mongoose';
import { CommandParameterListItem as CommandParameterListItemInterface, StoreCommandParameterListItem } from 'visualcal-common/dist/driver-builder';

export const CommandParameterListItemSchema = new mongoose.Schema<CommandParameterListItemInterface>({
  text: { type: String, required: true },
  value: { type: String, required: true }
});

export interface CommandParameterListItemStatic extends mongoose.Model<StoreCommandParameterListItem> {
  getAll(): Promise<StoreCommandParameterListItem[]>;
  build(driver: CommandParameterListItemInterface): StoreCommandParameterListItem;
  add(driver: CommandParameterListItemInterface): Promise<StoreCommandParameterListItem>;
}

CommandParameterListItemSchema.statics.build = (item: CommandParameterListItemInterface) => {
  return new CommandParameterListItem(item);
};

CommandParameterListItemSchema.statics.getAll = async () => {
  return await CommandParameterListItem.find().exec();
}

CommandParameterListItemSchema.statics.add = async (item: CommandParameterListItemInterface) => {
  const existing = await CommandParameterListItem.findOne({ _id: item._id });
  if (existing) throw new Error('Command parameter list item already exists');
  const newItem = CommandParameterListItem.build(item);
  return newItem.save();
}

export const CommandParameterListItem = mongoose.model<StoreCommandParameterListItem, CommandParameterListItemStatic>('CommandParameterListItem', CommandParameterListItemSchema);
