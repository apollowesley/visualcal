import path from 'path';
import fs, { promises as fsPromises } from 'fs';
import sanitizeFilename from 'sanitize-filename';
import { FileManagerBase } from './FileManagerBase';
import { IpcChannels } from '../../../@types/constants';

export interface Activatable {
  active: string;
}

export abstract class FileManagerTypedBase<TItem extends NamedType, TCreateItem extends NamedType> extends FileManagerBase {

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

  protected readFileAsJson(path: string) {
    const bufferAsString = this.readFileAsString(path);
    const asJson = JSON.parse(bufferAsString) as TItem;
    return asJson;
  }

  protected readAllJsonFiles(filename: string) {
    console.info('FileManagerTypedBase.readAllJsonFiles');
    const retVal: TItem[] = [];
    const possibleDirs = fs.readdirSync(this.baseDirPath, { withFileTypes: true });
    console.info('FileManagerTypedBase.readAllJsonFiles.possibleDirs', possibleDirs);
    const possibleDirsFiltered = possibleDirs.filter(d => d.isDirectory() && !this.getIsForbiddenName(d.name));
    console.info('FileManagerTypedBase.readAllJsonFiles.possibleDirsFiltered', possibleDirsFiltered);
    for (let index = 0; index < possibleDirsFiltered.length; index++) {
      const possibleDir = possibleDirsFiltered[index];
      const jsonPath = path.join(this.baseDirPath, possibleDir.name, filename);
      console.info('FileManagerTypedBase.readAllJsonFiles - Found item file', jsonPath);
      if (fs.existsSync(jsonPath)) {
        console.info('FileManagerTypedBase.readAllJsonFiles - Reading item file contents', jsonPath);
         try {
          const content = this.readFileAsJson(jsonPath);
          retVal.push(content);
          console.info('FileManagerTypedBase.readAllJsonFiles - Added item file contents to retVal', retVal);
         } catch (error) {
           throw error;
         }
      }
    }
    console.info('FileManagerTypedBase.readAllJsonFiles.retVal', retVal);
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

  async onCreatedItemDir(itemDirPath: string, sanitizedName: string) {
    // override if needed
  }

  abstract async saveItemJson(createItem: TCreateItem): Promise<TItem>;

  async create(item: TCreateItem): Promise<TItem> {
    const sanitizedName = sanitizeFilename(item.name);
    this.checkNotExists(sanitizedName);
    if (!this.baseDirExists) await this.createBaseDir();
    const itemDirPath = this.getItemDirPath(sanitizedName);
    await fsPromises.mkdir(itemDirPath);
    await this.onCreatedItemDir(itemDirPath, sanitizedName);
    const retVal = await this.saveItemJson(item);
    this.emit('created', retVal);
    if (global.visualCal.windowManager.mainWindow) global.visualCal.windowManager.mainWindow.webContents.send(IpcChannels.procedures.create.response, retVal);
    return retVal;
  }

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
