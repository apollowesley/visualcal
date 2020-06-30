import { EventEmitter } from 'events';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { IpcChannels } from '../../@types/constants';
import { ipcMain } from 'electron';

export class ResultManager extends EventEmitter {

  constructor() {
    super();
    ipcMain.on(IpcChannels.results.load.request, async (event, sessionName: string) => {
      try {
        const retVal = await this.load(sessionName);
        event.reply(IpcChannels.results.load.response, sessionName, retVal);
      } catch (error) {
        event.reply(IpcChannels.results.load.error, error);
      }
    });

    ipcMain.on(IpcChannels.results.save.request, async (event, sessionName: string, results: LogicResult[]) => {
      try {
        await this.save(sessionName, results);
        event.reply(IpcChannels.results.save.response, sessionName, results);
      } catch (error) {
        event.reply(IpcChannels.results.save.error, error);
      }
    });

    ipcMain.on(IpcChannels.results.saveOne.request, async (event, sessionName: string, result: LogicResult) => {
      try {
        await this.saveOne(sessionName, result);
        event.reply(IpcChannels.results.saveOne.response, sessionName, result);
      } catch (error) {
        event.reply(IpcChannels.results.saveOne.error, error);
      }
    });
  }

  async load(sessionName: string) {
    const buffer = await fsPromises.readFile(ResultManager.getResultsFilePath(sessionName));
    const resultsString = buffer.toString();
    const results = JSON.parse(resultsString) as LogicResult[];
    return results;
  }

  async save(sessionName: string, results: LogicResult[]) {
    const resultsString = JSON.stringify(results);
    await fsPromises.writeFile(ResultManager.getResultsFilePath(sessionName), resultsString);
    if (global.visualCal.windowManager.viewSessionWindow) global.visualCal.windowManager.viewSessionWindow.webContents.send(IpcChannels.results.save.response, sessionName, results);
  }

  async saveOne(sessionName: string, result: LogicResult) {
    const results = await this.load(sessionName);
    results.push(result);
    await this.save(sessionName, results);
    if (global.visualCal.windowManager.viewSessionWindow) global.visualCal.windowManager.viewSessionWindow.webContents.send(IpcChannels.results.saveOne.response, sessionName, result);
  }

  static getResultsDirPath(sessionName: string) {
    const retVal = path.join(global.visualCal.dirs.sessions, sessionName, 'results');
    return retVal;
  }

  static getResultsFilePath(sessionName: string) {
    const retVal = path.join(ResultManager.getResultsDirPath(sessionName), 'results.json');
    return retVal;
  }

}
