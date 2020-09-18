import { ipcMain } from 'electron';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { IpcChannels, VisualCalWindow } from '../../constants';
import NodeRed from '../node-red';
import { CrudManager } from './CrudManager';
import electronLog from 'electron-log';
import VisualCalNodeRedSettings from '../node-red-settings';
import { ExpressServer } from '../servers/express';

const log = electronLog.scope('ProcedureManager');
const nodeRed = NodeRed();

export class ProcedureManager extends CrudManager<CreateProcedureInfo, CreatedProcedureInfo, ProcedureFile, Procedure> {

  constructor(basePath: string) {
    super(basePath, IpcChannels.procedures, 'procedure');

    ipcMain.on(IpcChannels.procedures.setActive.request, async (event, procedureName: string) => {
      try {
        await this.setActive(procedureName);
        nodeRed.once('started', async () => {
          log.info(`Logic server started`);
          event.reply(IpcChannels.procedures.setActive.response, procedureName);
          await global.visualCal.windowManager.showSelectSessionWindow();
          global.visualCal.windowManager.closeAllBut(VisualCalWindow.SelectSession);
        });
        await nodeRed.start(ExpressServer.instance, VisualCalNodeRedSettings, global.visualCal.dirs.html.js);
      } catch (error) {
        event.reply(IpcChannels.procedures.setActive.error, error);
      }
    });
    log.info('Loaded');
  }

  static PROCEDURES_JSON_FILE_NAME = 'procedures.json';

  static PROCEDURE_LOGIC_FOLDER_NAME = 'logic';
  static PROCEDURE_JSON_FILE_NAME = 'procedure.json';
 
  async createProcedureLogicDir(name: string) { await fsPromises.mkdir(path.join(ProcedureManager.getProcedureDirPath(name), ProcedureManager.PROCEDURE_LOGIC_FOLDER_NAME)); };
  async createProcedureLogicFile(name: string) { await fsPromises.writeFile(path.join(ProcedureManager.getProcedureDirPath(name), ProcedureManager.PROCEDURE_LOGIC_FOLDER_NAME, 'flows.json'), JSON.stringify([])); };

  protected async onCreatedItemDir(itemDirPath: string, sanitizedName: string): Promise<void> {
    await this.createProcedureLogicDir(sanitizedName);
    await this.createProcedureLogicFile(sanitizedName);
  }

  protected getCreatedItem(createItem: CreateProcedureInfo) {
    return {
      ...createItem
    };
  }

  async load(procedureName: string) {
    const procedure = this.getOne(procedureName);
    return procedure;
  }

  static getProcedureDirPath(name: string) {
    const procDir = path.join(global.visualCal.dirs.userHomeData.procedures, name);
    return procDir;
  }

}
