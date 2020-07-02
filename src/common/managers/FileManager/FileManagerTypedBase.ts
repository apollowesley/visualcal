import path from 'path';
import fs, { promises as fsPromises } from 'fs';
import sanitizeFilename from 'sanitize-filename';
import { FileManagerBase } from './FileManagerBase';

export interface Activatable {
  active: string;
}

export abstract class FileManagerTypedBase<TItem> extends FileManagerBase {

  static FORBIDDEN_NAMES = [ '.DS_Store' ];

  private fItemFilenameWithoutExtension: string;

  constructor(baseDirPath: string, itemFilenameWithoutExtension: string) {
    super(baseDirPath);
    this.fItemFilenameWithoutExtension = itemFilenameWithoutExtension;
  }

  get itemFilenameWithoutExtension() { return this.fItemFilenameWithoutExtension; }
  get itemFilenameWithExtension() { return `${this.itemFilenameWithoutExtension}.json`; }
  get itemsFilenameWithExtension() { return `${this.itemFilenameWithoutExtension}s.json` }
  get itemsFilePath() { return path.join(this.baseDirPath, this.itemFilenameWithExtension); }

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

  protected async readAllJsonFiles(filename: string) {
    const retVal: TItem[] = [];
    const possibleDirs = await fsPromises.readdir(this.baseDirPath, { withFileTypes: true });
    const possibleDirsFiltered = possibleDirs.filter(d => d.isDirectory() && !this.getIsForbiddenName(d.name));
    await Promise.all(possibleDirsFiltered.map(async (possibleDir) => {
      const jsonPath = path.join(this.baseDirPath, possibleDir.name, filename);
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

  async remove(name: string) {
    const nameSanitized = sanitizeFilename(name);
    this.checkExists(nameSanitized);
    const dirPath = this.getItemDirPath(nameSanitized);
    await fsPromises.rmdir(dirPath, { recursive: true });
  }

  private async getItemsFileContents() {
    const itemsFilePath = path.join(this.baseDirPath, this.itemsFilenameWithExtension);
    const buffer = await fsPromises.readFile(itemsFilePath);
    const bufferString = buffer.toString();
    const itemsContents: Activatable = JSON.parse(bufferString);
    return itemsContents;
  }

  async getActive() {
    const itemsContents = await this.getItemsFileContents();
    return itemsContents.active;
  }

  async setActive(name: string) {
    this.checkExists(name);
    const itemsContents = await this.getItemsFileContents();
    itemsContents.active = name;
    const itemsContentsString = JSON.stringify(itemsContents);
    await fsPromises.writeFile(this.itemsFilePath, itemsContentsString);
    this.emit('set-active', name);
  }

  async update(name: string, contents: TItem) {
    this.checkExists(name);
    const filePath = this.getItemFileInfoPath(name);
    await this.saveJsonToFile(filePath, contents);
  }

}
