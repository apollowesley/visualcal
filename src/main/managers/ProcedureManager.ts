import { promises as fsPromises } from 'fs';
import path from 'path';
import { IpcChannels } from '../../@types/constants';
import { CrudManager } from './CrudManager';

export class ProcedureManager extends CrudManager<CreateProcedureInfo, CreatedProcedureInfo, ProcedureFile, Procedure> {

  constructor(basePath: string) {
    super(basePath, IpcChannels.procedures, 'procedure');
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

  static getProcedureDirPath(name: string) {
    const procDir = path.join(global.visualCal.dirs.procedures, name);
    return procDir;
  }

  /**
   * Loads the active procedure, if any, from the procedures.json file.
   * This should be call when the app starts.
   */
  static async loadActive() {
    const activeProc = await global.visualCal.procedureManager.getActive();
    if (activeProc) await global.visualCal.procedureManager.setActive(activeProc);
  }

}
