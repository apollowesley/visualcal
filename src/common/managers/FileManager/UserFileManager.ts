import { FileManagerBase } from './FileManagerBase';
import fs, { promises as fsPromises } from 'fs';
import { ProcedureFileManager } from './ProcedureFileManager';
import { SessionFileManager } from './SessionFileManager';
import path from 'path';

export class UserDirFileManager extends FileManagerBase {

  static CONFIG_FILE_NAME = 'config.json';

  private fProceduresFileManager: ProcedureFileManager;
  private fSessionsFileManager: SessionFileManager;

  constructor(baseDirPath: string) {
    super(baseDirPath);
    const proceduresBaseDirPath = path.join(baseDirPath, ProcedureFileManager.PROCEDURES_DIR_NAME);
    const sessionsBaseDirPath = path.join(baseDirPath, SessionFileManager.SESSIONS_DIR_NAME);
    this.fProceduresFileManager = new ProcedureFileManager(proceduresBaseDirPath);
    this.fSessionsFileManager = new SessionFileManager(sessionsBaseDirPath);
  }

  get configFilePath() { return path.join(this.baseDirPath, UserDirFileManager.CONFIG_FILE_NAME); };
  get procedures() { return this.fProceduresFileManager; };
  get sessions() { return this.fSessionsFileManager; };

  private async ensureConfigFileInitialized() {
    if (fs.existsSync(this.configFilePath)) return;
    await fsPromises.mkdir(this.configFilePath);
  }

  async ensureInitizilied() {
    if (!fs.existsSync(this.baseDirPath)) await fsPromises.mkdir(this.baseDirPath, { recursive: true });
    await this.fProceduresFileManager.ensureInitizilied();
    await this.fSessionsFileManager.ensureInitizilied();
    await this.ensureConfigFileInitialized();
  }

}
