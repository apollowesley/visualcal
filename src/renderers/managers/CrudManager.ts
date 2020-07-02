import { EventEmitter } from 'events';
import { IpcChannelCRUD } from '../../@types/constants';
import path from 'path';
import fs, { promises as fsPromises } from 'fs';
import sanitizeFilename from 'sanitize-filename';

export type EventNames = 'created' | 'removed' | 'renamed' | 'set-active';

export interface CrudManagerType<TCreate extends NamedType, TCreated extends NamedType, TItemsFile extends NamedType, TItem extends NamedType> extends EventEmitter {
  getAll(): Promise<TItem[]>;
  getOne(name: string): Promise<TItem | undefined>;
  create(info: TCreate): Promise<TCreated>;
  remove(name: string): Promise<void>;
  exists(name: string): boolean;
  rename(oldName: string, newName: string): Promise<TItem>;
  update(item: TItem): Promise<TItem>;
  getActive(): Promise<string | undefined>;
  setActive(name: string): Promise<void>;
  update(item: TItem): Promise<TItem>;
}

export abstract class CrudManager<TCreate extends NamedType, TCreated extends NamedType, TItemsFile extends NamedType, TItem extends NamedType> extends EventEmitter implements CrudManagerType<TCreate, TCreated, TItemsFile, TItem> {

  private fBasePath: string;
  private fItemFilename: string;

  constructor(basePath: string, channelNames: IpcChannelCRUD, itemFilename: string) {
    super();
    this.fBasePath = basePath;
    this.fItemFilename = itemFilename;
  }

  emit(event: EventNames | symbol, ...args: any[]): boolean {
    return super.emit(event, args);
  }

  getItemsJsonFilePath() {
    return path.join(this.fBasePath, this.fItemFilename + 's.json');
  }

  getItemDirPath(name: string) {
    const procDir = path.join(this.fBasePath, name);
    return procDir;
  };
  
  baseDirExists() { return fs.existsSync(this.fBasePath); };

  async createItemsDir() { await fsPromises.mkdir(this.fBasePath); };

  async createItemsJson() { await this.saveItemsJson({}); };

  async getItemsJson(){
    const fileBuffer = await fsPromises.readFile(this.getItemsJsonFilePath());
    const fileContent = fileBuffer.toString();
    const procsJson = JSON.parse(fileContent) as ProceduresFile;
    return procsJson;
  };
  
  async saveItemsJson(content?: ProceduresFile) {
    await fsPromises.writeFile(this.getItemsJsonFilePath(), JSON.stringify(content));
  };

  async getItemJson(name: string) {
    const procedureJsonFilePath = path.join(this.getItemDirPath(name), this.fItemFilename + '.json');
    const fileJson = await fsPromises.readFile(procedureJsonFilePath);
    const procFile = JSON.parse((fileJson).toString()) as TItem;
    return procFile;
  };

  async saveItemJson(name: string, item: any) {
    const procFilePath = path.join(this.getItemDirPath(name), this.fItemFilename + '.json');
    const procContent = JSON.stringify(item);
    await fsPromises.writeFile(procFilePath, procContent);
  };

  exists(name: string, shouldExist: boolean = true) {
    const procedureDirPath = this.getItemDirPath(name);
    const doesExist = fs.existsSync(procedureDirPath);
    return doesExist && shouldExist;
  }
  
  checkExists(name: string) {
    if (!this.exists(name, true)) throw new Error(`Procedure directory, ${name}, does not exist`);
  }
  
  checkNotExists(name: string) {
    if (this.exists(name, false)) throw new Error(`Procedure directory, ${name}, already exists`);
  }
  
  async getOne(name: string) {
    if (!this.exists(name)) return undefined;
    const dirPath = this.getItemDirPath(name);
    const infoFilePath = path.join(dirPath, this.fItemFilename + '.json');
    const info = JSON.parse((await fsPromises.readFile(infoFilePath)).toString()) as TItem;
    return info;
  }
  
  async getAll() {
    if (!this.baseDirExists()) return [];
    const dirNames = (await fsPromises.readdir(this.fBasePath, { withFileTypes: true })).filter(dir => dir.isDirectory() && dir.name !== 'logic').map(dir => dir.name);
    const retVal: TItem[] = [];
    for (const dirName of dirNames) {
      const proc = await this.getOne(dirName);
      if (proc) retVal.push(proc);
    }
    return retVal;
  }
  
  async create(createItem: TCreate) {
    const sanitizedName = sanitizeFilename(createItem.name);
    this.checkNotExists(sanitizedName);
    if (!this.baseDirExists()) await this.createItemsDir();
    const itemDirPath = this.getItemDirPath(sanitizedName);
    await fsPromises.mkdir(itemDirPath);
    await this.onCreatedItemDir(itemDirPath, sanitizedName);
    await this.saveItemJson(createItem.name, createItem);
    const retVal = this.getCreatedItem(createItem);
    this.emit('created', retVal);
    // if (window.visualCal.windowManager.mainWindow) window.visualCal.windowManager.mainWindow.webContents.send(this.fChannelNames.create.response, retVal);
    return retVal;
  }

  protected async onCreatedItemDir(itemDirPath: string, sanitizedName: string): Promise<void> {
    // Allow children to perform any follow-up work after creating an item directory
    return Promise.resolve();
  };

  protected abstract getCreatedItem(createItem: TCreate): TCreated;

  remove = async (name: string)  => {
    this.checkExists(name);
    const procPath = this.getItemDirPath(name);
    await fsPromises.rmdir(procPath, { recursive: true });
    this.emit('removed', name);
  }
  
  async rename(oldName: string, newName: string): Promise<TItem> {
    const oldNameSanitized = sanitizeFilename(oldName);
    const newNameSanitized = sanitizeFilename(newName);
    this.checkExists(oldNameSanitized);
    this.checkNotExists(newNameSanitized);
    const oldDirPath = this.getItemDirPath(oldNameSanitized);
    const newDirPath = this.getItemDirPath(newNameSanitized);
    const itemJson = await this.getItemJson(oldName);
    itemJson.name = newName;
    await this.saveItemJson(oldName, itemJson);
    await fsPromises.rename(oldDirPath, newDirPath);
    this.emit('renamed', { oldName, newName });
    // if (window.visualCal.windowManager.mainWindow) window.visualCal.windowManager.mainWindow.webContents.send(this.fChannelNames.rename.response, itemJson);
    return itemJson;
  }
  
  async getActive() {
    if (!fs.existsSync(this.getItemsJsonFilePath())) return undefined;
    const procsJson = await this.getItemsJson();
    return procsJson.active;
  }
  
  async setActive(name: string) {
    this.checkExists(name);
    if (!fs.existsSync(this.getItemsJsonFilePath())) await this.createItemsJson();
    const procsJson = await this.getItemsJson();
    procsJson.active = name;
    await this.saveItemsJson(procsJson);
    this.emit('set-active', name);
    await this.onSetActive(name);
    // if (window.visualCal.windowManager.mainWindow) window.visualCal.windowManager.mainWindow.webContents.send(this.fChannelNames.setActive.response, name);
  }
  
  protected async onSetActive(name: string) {
    // Override if needed
    return Promise.resolve();
  }

  async update(item: TItem) {
    this.checkExists(item.name);
    await this.saveItemJson(item.name, item);
    return item;
  }

}
