import { FileManagerBase } from './FileManagerBase';
import fs, { promises as fsPromises } from 'fs';
import path from 'path';

export class ProcedureFileManager extends FileManagerBase {

  static PROCEDURES_DIR_NAME = 'procedures';
  static PROCEDURES_JSON_NAME = 'procedures.json';
  static PROCEDURE_JSON_NAME = 'procedure.json';

  constructor(baseDirPath: string) {
    super(baseDirPath);
  }

  get proceduresJsonPath() { return path.join(this.baseDirPath, ProcedureFileManager.PROCEDURES_JSON_NAME); }

  getProcedureDirPath(procedureName: string) { return path.join(this.baseDirPath, procedureName); }
  getProcedureJsonPath(procedureName: string) { return path.join(this.getProcedureDirPath(procedureName), ProcedureFileManager.PROCEDURE_JSON_NAME); }

  async ensureInitizilied() {
    if (!fs.existsSync(this.baseDirPath)) await fsPromises.mkdir(this.baseDirPath, { recursive: true });
  }

  async getProcedureInfos() {
    return await this.readAllJsonFiles<ProcedureInfo>(ProcedureFileManager.PROCEDURE_JSON_NAME);
  }

}
