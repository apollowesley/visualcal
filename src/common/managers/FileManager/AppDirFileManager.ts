import { FileManagerBase } from './FileManagerBase';

export class AppDirFileManager extends FileManagerBase {

  constructor(baseDirPath: string) {
    super(baseDirPath);
  }

  async ensureInitizilied() {
    return await Promise.resolve();
  }

}
