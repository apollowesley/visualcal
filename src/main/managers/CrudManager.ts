import { BrowserWindow, ipcMain, IpcMainEvent } from 'electron';
import { IpcChannelCRUD } from '../../constants';
import path from 'path';
import fs, { promises as fsPromises } from 'fs';
import sanitizeFilename from 'sanitize-filename';
import { TypedEmitter } from 'tiny-typed-emitter';

interface Events<TCreated extends NamedType, TItem extends NamedType> {
  created: (item: TCreated) => void;
  removed: (name: string) => void;
  renamed: (value: { oldName: string; newName: string; }) => void;
  updated: (item: TItem) => void;
  activeSet: (activeName: string) => void;
}

interface CrudManagerType<TCreate extends NamedType, TCreated extends NamedType, TItemsFile extends NamedType, TItem extends NamedType> extends TypedEmitter<Events<TCreated, TItem>> {
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

export abstract class CrudManager<TCreate extends NamedType, TCreated extends NamedType, TItemsFile extends NamedType, TItem extends NamedType> extends TypedEmitter<Events<TCreated, TItem>> implements CrudManagerType<TCreate, TCreated, TItemsFile, TItem> {

  private fBasePath: string;
  private fChannelNames: IpcChannelCRUD;
  private fItemFilename: string;

  constructor(basePath: string, channelNames: IpcChannelCRUD, itemFilename: string) {
    super();
    this.fBasePath = basePath;
    this.fChannelNames = channelNames;
    this.fItemFilename = itemFilename;
    ipcMain.on(this.fChannelNames.create.request, async (event, item: TCreate) => {
      try {
        const retVal = await this.create(item);
        const window = BrowserWindow.fromWebContents(event.sender);
        if (!window || window.isDestroyed()) return;
        this.replyToWindow(event, this.fChannelNames.create.response, retVal);
      } catch (error) {
        this.replyToWindow(event, this.fChannelNames.create.error, error);
      }
    });

    ipcMain.on(this.fChannelNames.getActive.request, async (event) => {
      try {
        const retVal = await this.getActive();
        this.replyToWindow(event, this.fChannelNames.getActive.response, retVal);
      } catch (error) {
        this.replyToWindow(event, this.fChannelNames.getActive.error, error);
      }
    });

    ipcMain.on(this.fChannelNames.getAll.request, async (event) => {
      try {
        const retVal = await this.getAll();
        this.replyToWindow(event, this.fChannelNames.getAll.response, retVal);
      } catch (error) {
        this.replyToWindow(event, this.fChannelNames.getAll.error, error);
      }
    });

    ipcMain.on(this.fChannelNames.getExists.request, (event, name: string) => {
      try {
        const retVal = this.exists(name);
        this.replyToWindow(event, this.fChannelNames.getExists.response, retVal);
      } catch (error) {
        this.replyToWindow(event, this.fChannelNames.getExists.error, error);
      }
    });

    ipcMain.on(this.fChannelNames.getOne.request, async (event, name: string) => {
      try {
        const retVal = await this.getOne(name);
        this.replyToWindow(event, this.fChannelNames.getOne.response, retVal);
      } catch (error) {
        this.replyToWindow(event, this.fChannelNames.getOne.error, error);
      }
    });

    ipcMain.on(this.fChannelNames.remove.request, async (event, name: string) => {
      try {
        await this.remove(name);
        this.replyToWindow(event, this.fChannelNames.remove.response, name);
      } catch (error) {
        this.replyToWindow(event, this.fChannelNames.remove.error, error);
      }
    });

    ipcMain.on(this.fChannelNames.rename.request, async (event, oldName: string, newName: string) => {
      try {
        await this.rename(oldName, newName);
        this.replyToWindow(event, this.fChannelNames.rename.response, { oldName, newName });
      } catch (error) {
        this.replyToWindow(event, this.fChannelNames.rename.error, error);
      }
    });

    ipcMain.on(this.fChannelNames.setActive.request, async (event, name: string) => {
      try {
        await this.setActive(name);
        this.replyToWindow(event, this.fChannelNames.setActive.response, name);
      } catch (error) {
        this.replyToWindow(event, this.fChannelNames.setActive.error, error);
      }
    });

    ipcMain.on(this.fChannelNames.update.request, async (event, item: TItem) => {
      try {
        await this.update(item);
        this.replyToWindow(event, this.fChannelNames.update.response, item);
      } catch (error) {
        this.replyToWindow(event, this.fChannelNames.update.error, error);
      }
    });
  }

  protected replyToWindow(event: IpcMainEvent, channel: string, ...args: any[]) {
    if (!event.sender || event.sender.isDestroyed()) return;
    event.reply(channel, ...args);
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

  //** Checks if a directory exists using case-insensitive matching. */
  exists(name: string) {
    const dirEntries = fs.readdirSync(this.fBasePath, { withFileTypes: true });
    const nameLowerCase = name.toLocaleLowerCase();
    for (const entry of dirEntries) {
      if (!entry.isDirectory()) continue;
      const curDirName = entry.name.toLocaleLowerCase();
      if (curDirName === nameLowerCase) {
        return true;
      }
    };
    return false;
  }

  //** Checks if a directory does exist, and throws an Error if it doesn't. */
  checkExists(name: string) {
    const doesExist = this.exists(name);
    if (!doesExist) throw new Error(`Directory, ${name}, already exists`);
  }
  
  //** Checks if a directory does not exist, and throws an Error if it does. */
  checkNotExists(name: string) {
    const doesExist = this.exists(name);
    if (doesExist) throw new Error(`Directory, ${name}, already exists`);
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
  
  protected onCreated(item: TCreated) {
    this.emit('created', item);
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
    this.onCreated(retVal);
    ipcMain.sendToAll(this.fChannelNames.create.response, retVal);
    return retVal;
  }

  protected async onCreatedItemDir(itemDirPath: string, sanitizedName: string): Promise<void> {
    // Allow children to perform any follow-up work after creating an item directory
    await Promise.resolve();
  };

  protected abstract getCreatedItem(createItem: TCreate): TCreated;

  remove = async (name: string)  => {
    this.checkExists(name);
    const procPath = this.getItemDirPath(name);
    await fsPromises.rmdir(procPath, { recursive: true });
    this.emit('removed', name);
  }
  
  async rename(oldName: string, newName: string): Promise<TItem> {
    const oldNameSanitized = sanitizeFilename(oldName.trim());
    const newNameSanitized = sanitizeFilename(newName.trim());
    this.checkExists(oldNameSanitized);
    this.checkNotExists(newNameSanitized);
    const oldDirPath = this.getItemDirPath(oldNameSanitized);
    const newDirPath = this.getItemDirPath(newNameSanitized);
    const itemJson = await this.getItemJson(oldName);
    itemJson.name = newName;
    await this.saveItemJson(oldName, itemJson);
    await fsPromises.rename(oldDirPath, newDirPath);
    this.emit('renamed', { oldName, newName });
    ipcMain.sendToAll(this.fChannelNames.rename.response, itemJson);
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
    await this.onSetActive(name);
    this.emit('activeSet', name);
    ipcMain.sendToAll(this.fChannelNames.setActive.response, name);
  }
  
  protected async onSetActive(name: string) {
    // Override if needed
    await Promise.resolve();
  }

  async update(item: TItem) {
    this.checkExists(item.name);
    await this.saveItemJson(item.name, item);
    this.emit('updated', item);
    ipcMain.sendToAll(this.fChannelNames.update.response, item.name);
    return item;
  }

}
