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
    for (const instructionSet of bodyDriver.instructionSets) {
      const storeInstructionSet = await models.InstructionSet.create();
      storeInstructionSet._id = instructionSet.id;
      storeInstructionSet.name = instructionSet.name;
      for (const instruction of instructionSet.instructions) {
        const storeInstruction = await models.Instruction.create();
        storeInstruction._id = instruction.id;
        storeInstruction.command = instruction.command;
        storeInstruction.delayAfter = instruction.delayAfter;
        storeInstruction.delayBefore = instruction.delayBefore;
        storeInstruction.description = instruction.description;
        storeInstruction.helpUri = instruction.helpUri;
        storeInstruction.name = instruction.name;
        storeInstruction.order = instruction.order;
        storeInstruction.readAttempts = instruction.readAttempts;
        storeInstruction.responseDataType = instruction.responseDataType;
        storeInstruction.type = instruction.type;
        if (instruction.parameters) {
          storeInstruction.parameters = [];
          for (const commandParameter of instruction.parameters) {
            const storeCommandParameter = await models.CommandParameter.create();
            storeCommandParameter.afterText = commandParameter.afterText;
            storeCommandParameter.beforeText = commandParameter.beforeText;
            storeCommandParameter.default = commandParameter.default;
            storeCommandParameter.falseValue = commandParameter.falseValue;
            storeCommandParameter._id = commandParameter.id;
            storeCommandParameter.minMaxIncrement = commandParameter.increment;
            storeCommandParameter.max = commandParameter.max;
            storeCommandParameter.min = commandParameter.min;
            storeCommandParameter.prompt = commandParameter.prompt;
            storeCommandParameter.required = commandParameter.required;
            storeCommandParameter.trueValue = commandParameter.trueValue;
            storeCommandParameter.type = commandParameter.type;
            storeCommandParameter.useMinMaxIncrement = commandParameter.useIncrement;
            storeCommandParameter.useMax = commandParameter.useMax;
            storeCommandParameter.useMin = commandParameter.useMin;
            if (commandParameter.listItems) {
              for (const listItem of commandParameter.listItems) {
                storeCommandParameter.listItems = [];
                const storeListItem = await models.CommandParameterListItem.create();
                storeListItem._id = listItem.id;
                storeListItem.text = listItem.text;
                storeListItem.value = listItem.value;
                storeCommandParameter.listItems.push(storeListItem);
              }
            }
            storeInstruction.parameters.push(storeCommandParameter);
          }
        }
        storeInstructionSet.instructions.push(storeInstruction);
      }
      driver.instructionSets.push(storeInstructionSet);
    }
    await driver.save();
    return res.json(driver);
  } catch (error) {
    res.statusCode = 400;
    return res.send(error);
  }
}
