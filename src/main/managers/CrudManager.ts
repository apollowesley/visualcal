import { EventEmitter } from 'events';
import { ipcMain } from 'electron';
import { IpcChannelCRUD } from '../../@types/constants';
import path from 'path';
import fs, { promises as fsPromises } from 'fs';
import sanitizeFilename from 'sanitize-filename';

export type EventNames = 'created' | 'removed' | 'renamed' | 'set-active';

export interface CrudManagerType<TCreate extends NamedType, TCreated extends NamedType, TItem extends NamedType> extends EventEmitter {
  getAll(): Promise<TItem[]>;
  getOne(name: string): Promise<TItem | undefined>;
  create(info: TCreate): Promise<TCreated>;
  remove(name: string): Promise<void>;
  exists(name: string): boolean;
  rename(oldName: string, newName: string): Promise<TItem>;
  getActive(): Promise<string | undefined>;
  setActive(name: string): Promise<void>;
}

export abstract class CrudManager<TCreate extends NamedType, TCreated extends NamedType, TItem extends NamedType> extends EventEmitter implements CrudManagerType<TCreate, TCreated, TItem> {

  private fBasePath: string;
  private fChannelNames: IpcChannelCRUD;
  private fItemFilename: string;

  constructor(basePath: string, channelNames: IpcChannelCRUD, itemFilename: string) {
    super();
    this.fBasePath = basePath;
    this.fChannelNames = channelNames;
    this.fItemFilename = itemFilename;
    ipcMain.on(this.fChannelNames.create.request, async (event, procedure: TCreate) => {
      try {
        const retVal = await this.create(procedure);
        event.reply(this.fChannelNames.create.response, retVal);
      } catch (error) {
        event.reply(this.fChannelNames.create.error, error);
      }
    });

    ipcMain.on(this.fChannelNames.getActive.request, async (event) => {
      try {
        const retVal = await this.getActive();
        event.reply(this.fChannelNames.getActive.response, retVal);
      } catch (error) {
        event.reply(this.fChannelNames.getActive.error, error);
      }
    });

    ipcMain.on(this.fChannelNames.getAll.request, async (event) => {
      try {
        const retVal = await this.getAll();
        event.reply(this.fChannelNames.getAll.response, retVal);
      } catch (error) {
        event.reply(this.fChannelNames.getAll.error, error);
      }
    });

    ipcMain.on(this.fChannelNames.getExists.request, async (event, name: string) => {
      try {
        const retVal = await this.exists(name);
        event.reply(this.fChannelNames.getExists.response, retVal);
      } catch (error) {
        event.reply(this.fChannelNames.getExists.error, error);
      }
    });

    ipcMain.on(this.fChannelNames.getOne.request, async (event, name: string) => {
      try {
        const retVal = await this.getOne(name);
        event.reply(this.fChannelNames.getOne.response, retVal);
      } catch (error) {
        event.reply(this.fChannelNames.getOne.error, error);
      }
    });

    ipcMain.on(this.fChannelNames.remove.request, async (event, name: string) => {
      try {
        await this.remove(name);
        event.reply(this.fChannelNames.remove.response, name);
      } catch (error) {
        event.reply(this.fChannelNames.remove.error, error);
      }
    });

    ipcMain.on(this.fChannelNames.rename.request, async (event, oldName: string, newName: string) => {
      try {
        await this.rename(oldName, newName);
        event.reply(this.fChannelNames.rename.response, { oldName, newName });
      } catch (error) {
        event.reply(this.fChannelNames.rename.error, error);
      }
    });

    ipcMain.on(this.fChannelNames.setActive.request, async (event, name: string) => {
      try {
        await this.setActive(name);
        event.reply(this.fChannelNames.setActive.response, name);
      } catch (error) {
        event.reply(this.fChannelNames.setActive.error, error);
      }
    });
  }

  emit(event: EventNames | symbol, ...args: any[]): boolean {
    return super.emit(event, args);
  }

  getItemDirPath(name: string) {
    const procDir = path.join(this.fBasePath, name);
    return procDir;
  };
  
  baseDirExists() { return fs.existsSync(this.fBasePath); };

  async createProceduresDir() { await fsPromises.mkdir(this.fBasePath); };

  async saveProceduresJson(content?: ProceduresFile) { await fsPromises.writeFile(this.fItemFilename + 's', JSON.stringify(content)); };
  async createProceduresJson() { await this.saveProceduresJson({}); };

  async getItemsJson(){
    const fileBuffer = await fsPromises.readFile(this.fItemFilename + 's');
    const fileContent = fileBuffer.toString();
    const procsJson = JSON.parse(fileContent) as ProceduresFile;
    return procsJson;
  };
  
  async saveItemJson(name: string, item: any) {
    const procFilePath = path.join(this.getItemDirPath(name), this.fItemFilename + '.json');
    const procContent = JSON.stringify(item);
    await fsPromises.writeFile(procFilePath, procContent);
  };

  async getItemJson(name: string) {
    const procedureJsonFilePath = path.join(this.getItemDirPath(name), this.fItemFilename + '.json');
    const fileJson = await fsPromises.readFile(procedureJsonFilePath);
    const procFile = JSON.parse((fileJson).toString()) as TItem;
    return procFile;
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
    const procDirPath = this.getItemDirPath(name);
    // const sectionsDirPath = path.join(procDirPath, 'sections');
    const procInfoFilePath = path.join(procDirPath, 'procedure.json');
    const procInfo = JSON.parse((await fsPromises.readFile(procInfoFilePath)).toString()) as TItem;
    return procInfo;
  }
  
  async getAll() {
    if (!this.baseDirExists()) return [];
    const proceduresDirNames = (await fsPromises.readdir(this.fBasePath, { withFileTypes: true })).filter(dir => dir.isDirectory() && dir.name !== 'logic').map(dir => dir.name);
    const retVal: TItem[] = [];
    for (const procDirName of proceduresDirNames) {
      const proc = await this.getOne(procDirName);
      if (proc) retVal.push(proc);
    }
    return retVal;
  }
  
  async create(createItem: TCreate) {
    const sanitizedName = sanitizeFilename(createItem.name);
    this.checkNotExists(sanitizedName);
    if (!this.baseDirExists()) await this.createProceduresDir();
    const itemDirPath = this.getItemDirPath(sanitizedName);
    await fsPromises.mkdir(itemDirPath);
    await this.onCreatedItemDir(itemDirPath, sanitizedName);
    await this.saveItemJson(createItem.name, createItem);
    const retVal = this.getCreatedItem(createItem);
    this.emit('created', retVal);
    if (global.visualCal.windowManager.mainWindow) global.visualCal.windowManager.mainWindow.webContents.send(this.fChannelNames.create.response, retVal);
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
    if (global.visualCal.windowManager.mainWindow) global.visualCal.windowManager.mainWindow.webContents.send(this.fChannelNames.rename.response, itemJson);
    return itemJson;
  }
  
  async getActive() {
    if (!fs.existsSync(this.fItemFilename + 's')) return undefined;
    const procsJson = await this.getItemsJson();
    return procsJson.active;
  }
  
  async setActive(name: string) {
    this.checkExists(name);
    if (!fs.existsSync(this.fItemFilename + 's')) await this.createProceduresJson();
    const procsJson = await this.getItemsJson();
    procsJson.active = name;
    await this.saveProceduresJson(procsJson);
    this.emit('set-active', name);
  }
  
}
