import path from 'path';
import fs, { promises as fsPromises } from 'fs';
import sanitizeFilename from 'sanitize-filename';
import { FileManagerBase } from './FileManagerBase';

export abstract class FileManagerTypedBase<TItem> extends FileManagerBase {

  static FORBIDDEN_NAMES = [ '.DS_Store' ];

  constructor(baseDirPath: string) {
    super(baseDirPath);
  }

  getIsForbiddenName(name: string) {
    const nameUpperCaseName = name.toLocaleUpperCase();
    let retVal = false;
    FileManagerTypedBase.FORBIDDEN_NAMES.forEach(forbiddenName => {
      if (forbiddenName.toLocaleUpperCase() === nameUpperCaseName) retVal = true;
    });
    return retVal;
  }

  protected async readFileAsJson(path: string) {
    const bufferAsString = await this.readFileAsString(path);
    const asJson = JSON.parse(bufferAsString) as TItem;
    return asJson;
  }

  protected async readAllJsonFiles(jsonFilename: string) {
    const retVal: TItem[] = [];
    const possibleDirs = await fsPromises.readdir(this.baseDirPath, { withFileTypes: true });
    const possibleDirsFiltered = possibleDirs.filter(d => d.isDirectory() && !this.getIsForbiddenName(d.name));
    await Promise.all(possibleDirsFiltered.map(async (possibleDir) => {
      const jsonPath = path.join(this.baseDirPath, possibleDir.name, jsonFilename);
      if (fs.existsSync(jsonPath)) {
        const content = await this.readFileAsJson(jsonPath);
        retVal.push(content);
      }
    }));
    return retVal;
  }

  exists(name: string) {
    return fs.existsSync(this.getItemDirPath(name));
  }

  checkExists(name: string) {
    if (!this.exists(name)) throw new Error(`Directory, ${name}, does not exist`);
  }
  
  checkNotExists(name: string) {
    if (this.exists(name)) throw new Error(`Directory, ${name}, already exists`);
  }

  abstract getItemDirPath(name: string): string;
  abstract getItemFileInfoPath(name: string): string;
  abstract onRename(oldName: string, newName: string, item: TItem): TItem;

  async rename(oldName: string, newName: string): Promise<TItem> {
    const oldNameSanitized = sanitizeFilename(oldName);
    const newNameSanitized = sanitizeFilename(newName);
    this.checkExists(oldNameSanitized);
    this.checkNotExists(newNameSanitized);
    const oldDirPath = this.getItemDirPath(oldNameSanitized);
    const newDirPath = this.getItemDirPath(newNameSanitized);
    const oldItemFilePath = this.getItemFileInfoPath(oldNameSanitized);
    // const newItemFilePath = this.getItemFileInfoPath(newNameSanitized);
    let item = await this.readFileAsJson(oldItemFilePath);
    item = this.onRename(oldName, newName, item);
    await this.saveJsonToFile(oldItemFilePath, item);
    await fsPromises.rename(oldDirPath, newDirPath);
    this.emit('renamed', { oldName, newName });
    return item;
  }

}
