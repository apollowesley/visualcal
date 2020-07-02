import { FileManagerBase } from './FileManagerBase';
import fs, { promises as fsPromises } from 'fs';
import { ProcedureFileManager } from './ProcedureFileManager';
import { SessionFileManager } from './SessionFileManager';
import path from 'path';
import { UserConfig } from '../../../types/UserConfig';
import { UserConfigDefaults } from '../../../types/constants';

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

  async getConfig() {
    const contents = await this.readFileAsString(this.configFilePath);
    return await JSON.parse(contents) as UserConfig;
  }

  async saveConfig(config: UserConfig) {
    await this.saveJsonToFile(this.configFilePath, config, true);
  }

  private async ensureConfigFileInitialized() {
    if (fs.existsSync(this.configFilePath)) return;
    const defaults = UserConfigDefaults;
    await this.saveConfig(defaults);
  }

  async ensureInitizilied() {
    if (!fs.existsSync(this.baseDirPath)) await fsPromises.mkdir(this.baseDirPath, { recursive: true });
    await this.fProceduresFileManager.ensureInitizilied();
    await this.fSessionsFileManager.ensureInitizilied();
    await this.ensureConfigFileInitialized();
  }

  // ***** ABSTRACT INHERITED *****

  getItemDirPath(name: string): string {
    return this.baseDirPath;
  }

  getItemFileInfoPath(name: string): string {
    return path.join(this.baseDirPath, UserDirFileManager.CONFIG_FILE_NAME);
  }

  onRename(oldName: string, newName: string, item: UserConfig): UserConfig {
    return item;
  }

  // ******************************

}