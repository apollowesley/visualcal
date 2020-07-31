import { EventEmitter } from 'events';
import { Config as BenchConfig } from '../../@types/bench';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { ipcMain } from 'electron';
import { IpcChannels } from '../../constants';

export class BenchConfigManager extends EventEmitter {
  
  static CONFIG_FILENAME: string = 'bench.json';

  private fBaseDirPath: string;

  constructor(baseDirPath: string) {
    super();
    this.fBaseDirPath = baseDirPath;
    ipcMain.on(IpcChannels.benchConfig.load.request, async (event, username?: string) => {
      try {
        const config = await this.getConfig()
      } catch (error) {
        event.reply(IpcChannels.benchConfig.load.error, error);
      }
    });
  }

  private getFilePath(username?: string) {
    if (username) return path.join(this.fBaseDirPath, username, BenchConfigManager.CONFIG_FILENAME);
    return path.join(this.fBaseDirPath, BenchConfigManager.CONFIG_FILENAME);
  }

  async getConfig(username?: string) {
    const filePath = this.getFilePath(username);
    const contentBuffer = await fsPromises.readFile(filePath);
    const contentString = contentBuffer.toString();
    const contentJson = JSON.parse(contentString);
    return contentJson as BenchConfig;
  }

  async saveConfig(config: BenchConfig, username?: string) {
    const filePath = this.getFilePath(username);
    const contentString = JSON.stringify(config);
    await fsPromises.writeFile(filePath, contentString);
  }

}
