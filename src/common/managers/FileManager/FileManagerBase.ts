import { EventEmitter } from 'events';
import fs, { promises as fsPromises } from 'fs';
import path from 'path';

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

  protected async readFileAsString(path: string) {
    const buffer = await fsPromises.readFile(path);
    const bufferAsString = buffer.toString();
    return bufferAsString;
  }

  protected async saveJsonToFile(path: string, contents: any, pretty: boolean = true) {
    const spaces = pretty ? 2 : '';
    const contentsString = JSON.stringify(contents, null, spaces);
    await fsPromises.writeFile(path, contentsString);
  }

}
