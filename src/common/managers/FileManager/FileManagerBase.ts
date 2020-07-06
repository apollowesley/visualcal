import { EventEmitter } from 'events';
import fs, { promises as fsPromises } from 'fs';

export abstract class FileManagerBase extends EventEmitter {

  private fBaseDirPath: string;

  constructor(baseDirPath: string) {
    super();
    this.fBaseDirPath = baseDirPath;
  }

  /**
   * Determines if the directory exists and is initialized, and if not creates it and all required sub directories and files.
   * <br>DO NOT CALL FROM RENDERER
   */
  abstract async ensureInitizilied(): Promise<void>;

  get baseDirPath() { return this.fBaseDirPath };
  get baseDirExists() { return fs.existsSync(this.baseDirPath); };

  protected async createBaseDir() {
    await fsPromises.mkdir(this.baseDirPath, { recursive: true });
  }

  protected readFileAsString(filePath: string) {
    const dataAsString = fs.readFileSync(filePath).toString();
    return dataAsString;
  }

  protected async saveJsonToFile(path: string, contents: any, pretty: boolean = true) {
    const spaces = pretty ? 2 : '';
    const contentsString = JSON.stringify(contents, null, spaces);
    await fsPromises.writeFile(path, contentsString);
  }

}
