import { ipcMain } from 'electron';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { IpcChannels } from '../../constants';
import { CrudManager } from './CrudManager';
import electronLog from 'electron-log';

const log = electronLog.scope('ProcedureManager');

export class ProcedureManager extends CrudManager<CreateProcedureInfo, CreatedProcedureInfo, ProcedureFile, Procedure> {

  constructor(basePath: string) {
    super(basePath, IpcChannels.procedures, 'procedure');

    ipcMain.on(IpcChannels.procedures.setActive.request, async (event, procedureName: string) => {
      try {
        await this.setActive(procedureName);
        // Don't reply since we close the window as soon as we set the active procedure
        // event.reply(IpcChannels.procedures.setActive.response, procedureName);
      } catch (error) {
        event.reply(IpcChannels.procedures.setActive.error, error);
      }
    });
    log.info('Loaded');
  }

  static PROCEDURES_JSON_FILE_NAME = 'procedures.json';

  static PROCEDURE_LOGIC_FOLDER_NAME = 'logic';
  static PROCEDURE_JSON_FILE_NAME = 'procedure.json';
  
  static PROCEDURES_ASSETS_FOLDER_NAME = 'assets';
  static PROCEDURES_ASSETS_GITKEEP_FILE_NAME = '.gitkeep';

  async createProcedureLogicDir(name: string) { await fsPromises.mkdir(path.join(ProcedureManager.getProcedureDirPath(name), ProcedureManager.PROCEDURE_LOGIC_FOLDER_NAME)); };
  async createProcedureAssetsDir(name: string) { await fsPromises.mkdir(path.join(ProcedureManager.getProcedureDirPath(name), ProcedureManager.PROCEDURES_ASSETS_FOLDER_NAME)); };
  async createProcedureAssetsGitKeepFile(name: string) { await fsPromises.writeFile(path.join(ProcedureManager.getProcedureDirPath(name), ProcedureManager.PROCEDURES_ASSETS_FOLDER_NAME, ProcedureManager.PROCEDURES_ASSETS_GITKEEP_FILE_NAME), ''); };
  async createProcedureLogicFile(name: string) { await fsPromises.writeFile(path.join(ProcedureManager.getProcedureDirPath(name), ProcedureManager.PROCEDURE_LOGIC_FOLDER_NAME, 'flows.json'), JSON.stringify([])); };

  protected async onCreatedItemDir(itemDirPath: string, sanitizedName: string): Promise<void> {
    await this.createProcedureAssetsDir(sanitizedName);
    await this.createProcedureAssetsGitKeepFile(sanitizedName);
    await this.createProcedureLogicDir(sanitizedName);
    await this.createProcedureLogicFile(sanitizedName);
    await super.onCreatedItemDir(itemDirPath, sanitizedName);
  }

  protected onCreated(item: CreatedProcedureInfo) {
    super.onCreated(item);
    this.setActive(item.name);
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
