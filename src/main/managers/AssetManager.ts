import { EventEmitter } from 'events';
import path from 'path';
import fs, { promises as fsPromises } from 'fs';
import { ipcMain } from 'electron';
import { IpcChannels } from '../../constants';

export class AssetManager extends EventEmitter {

  constructor() {
    super();
    ipcMain.on(IpcChannels.assets.saveToCurrentProcedure.request, async (event, info: { name: string, contents: ArrayBuffer }) => {
      try {
        await this.saveToCurrentProcedure(info.name, info.contents);
        event.reply(IpcChannels.assets.saveToCurrentProcedure.response, { name: info.name });
      } catch (error) {
        event.reply(IpcChannels.assets.saveToCurrentProcedure.error, { err: error });
      }
    });
  }

  getDirPathForProcedure(procedureName: string) {
    const procedureDirPath = path.join(global.visualCal.dirs.userHomeData.procedures, procedureName);
    const assetsDirPath = path.join(procedureDirPath, 'assets');
    return assetsDirPath;
  }

  async loadFromProcedure(procedureName: string, filename: string) {
    const assetsDirPath = this.getDirPathForProcedure(procedureName);
    const filePath = path.join(assetsDirPath, filename);
    const fileBuffer = await fsPromises.readFile(filePath);
    const fileContents = 'data:image/png;base64,' + fileBuffer.toString('base64');
    return fileContents;
  }

  async loadFromCurrentProcedure(filename: string) {
    const currentProcedureName = await global.visualCal.procedureManager.getActive();
    if (!currentProcedureName) throw new Error('Current procedure is not set, unable to load asset');
    return await this.loadFromProcedure(currentProcedureName, filename);
  }

  async allFromProcedure(procedureName: string) {
    const assetsDirPath = this.getDirPathForProcedure(procedureName);
    const assets = await fsPromises.readdir(assetsDirPath, { withFileTypes: true });
    return assets.filter(a => a.isFile).map(a => a.name);
  }

  async saveToProcedure(procedureName: string, filename: string, contents: ArrayBuffer) {
    const assetsDirPath = this.getDirPathForProcedure(procedureName);
    if (!fs.existsSync(assetsDirPath)) fs.mkdirSync(assetsDirPath, { recursive: true });
    const filePath = path.join(assetsDirPath, filename);
    const fileContents = new Uint8Array(contents);
    await fsPromises.writeFile(filePath, fileContents);
  }

  async saveToCurrentProcedure(filename: string, contents: ArrayBuffer) {
    const currentProcedureName = await global.visualCal.procedureManager.getActive();
    if (!currentProcedureName) throw new Error('Current procedure is not set, unable to save asset');
    await this.saveToProcedure(currentProcedureName, filename, contents);
  }

}
