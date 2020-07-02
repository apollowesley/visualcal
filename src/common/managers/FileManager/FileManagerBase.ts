import { EventEmitter } from 'events';
import { promises as fsPromises } from 'fs';
import path from 'path';

export abstract class FileManagerBase extends EventEmitter {

  private fBaseDirPath: string;

  constructor(baseDirPath: string) {
    super();
    this.fBaseDirPath = baseDirPath;
  }

  get baseDirPath() { return this.fBaseDirPath };

  /**
   * Determines if the directory exists and is initialized, and if not creates it and all required sub directories and files.
   * <br>DO NOT CALL FROM RENDERER
   */
  abstract async ensureInitizilied(): Promise<void>;

  protected async readFileAsString(path: string) {
    const buffer = await fsPromises.readFile(path);
    const bufferAsString = buffer.toString();
    return bufferAsString;
  }

  protected async readFileAsJson<T>(path: string) {
    const bufferAsString = await this.readFileAsString(path);
    const asJson = JSON.parse(bufferAsString) as T;
    return asJson;
  }

  protected async saveJsonToFile(path: string, contents: object, pretty: boolean = false) {
    const spaces = pretty ? 2 : '';
    const contentsString = JSON.stringify(contents, null, spaces);
    await fsPromises.writeFile(path, contentsString);
  }

}
