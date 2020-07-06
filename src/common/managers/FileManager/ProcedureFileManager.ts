import { FileManagerTypedBase } from './FileManagerTypedBase';
import fs, { promises as fsPromises } from 'fs';
import path from 'path';
import sanitizeFilename from 'sanitize-filename';

export class ProcedureFileManager extends FileManagerTypedBase<Procedure, CreateProcedureInfo> {

  static PROCEDURES_DIR_NAME = 'procedures';
  static PROCEDURES_JSON_NAME = 'procedures.json';
  static PROCEDURE_JSON_NAME = 'procedure.json';
  
  constructor(baseDirPath: string) {
    super(baseDirPath, 'procedure');
  }

  get proceduresJsonPath() { return path.join(this.baseDirPath, ProcedureFileManager.PROCEDURES_JSON_NAME); }

  getProcedureDirPath(name: string) { return path.join(this.baseDirPath, name); }
  getProcedureJsonPath(name: string) { return path.join(this.getProcedureDirPath(name), ProcedureFileManager.PROCEDURE_JSON_NAME); }

  async ensureInitizilied() {
    if (!fs.existsSync(this.baseDirPath)) await fsPromises.mkdir(this.baseDirPath, { recursive: true });
  }

  getProcedures() {
    console.info('ProcedureFileManager.getProcedures');
    return this.readAllJsonFiles(ProcedureFileManager.PROCEDURE_JSON_NAME);
  }

  // ***** ABSTRACT INHERITED *****

  getItemDirPath(name: string): string {
    return this.getProcedureDirPath(name);
  }

  getItemFileInfoPath(name: string) {
    return this.getProcedureJsonPath(name);
  }

  onRename(oldName: string, newName: string, item: Procedure): Procedure {
    item.name = newName;
    return item;
  }

  async onCreatedItemDir(itemDirPath: string, sanitizedName: string) {
    const logicDirPath = path.join(itemDirPath, 'logic');
    const logicFlowFilePath = path.join(logicDirPath, 'flows.json');
    await fsPromises.mkdir(logicDirPath, { recursive: true });
    await fsPromises.writeFile(logicFlowFilePath, '[]');
  }

  async saveItemJson(createItem: CreateProcedureInfo): Promise<Procedure> {
    const itemPath = this.getItemFileInfoPath(createItem.name);
    const procedure: Procedure = {
      name: createItem.name,
      description: createItem.description || '',
      authorOrganization: '',
      authors: [],
      sections: [],
      version: ''
    };
    const procedureString = JSON.stringify(procedure);
    await fsPromises.writeFile(itemPath, procedureString);
    return procedure;
  }

  // ******************************

}
