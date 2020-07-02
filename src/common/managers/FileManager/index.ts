import { EventEmitter } from 'events';
import { AppDirFileManager } from './AppDirFileManager';
import { UserDirFileManager } from './UserFileManager';

export class FileManager extends EventEmitter {

  private fAppDirFileManager: AppDirFileManager;
  private fUserDirFileManager: UserDirFileManager;

  constructor(baseAppDirPath: string, baseUserDirPath: string) {
    super();
    this.fAppDirFileManager = new AppDirFileManager(baseAppDirPath);
    this.fUserDirFileManager = new UserDirFileManager(baseUserDirPath);
  }

  get app() { return this.fAppDirFileManager; };
  get user() { return this.fUserDirFileManager; };

  get baseAppDirPath() { return this.fAppDirFileManager.baseDirPath };
  get baseUserDirPath() { return this.fUserDirFileManager.baseDirPath };

  /**
   * Determines if the directory exists and is initialized, and if not creates it and all required sub directories and files.
   */
  async ensureInitizilied() {
    await this.fAppDirFileManager.ensureInitizilied();
    await this.fUserDirFileManager.ensureInitizilied();
  }

}
