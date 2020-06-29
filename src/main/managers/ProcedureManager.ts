import { EventEmitter } from 'events'
import fs, { promises as fsPromises } from 'fs';
import path from 'path';
import sanitizeFilename from 'sanitize-filename';

export type EventNames = 'created' | 'removed' | 'renamed' | 'set-active';

export interface ProcedureManagerType extends EventEmitter {
  getAll(): Promise<Procedure[]>;
  getOne(name: string): Promise<Procedure | undefined>;
  create(info: CreateProcedureInfo): Promise<CreatedProcedureInfo>;
  remove(name: string): Promise<void>;
  exists(name: string): boolean;
  rename(oldName: string, newName: string): Promise<ProcedureFile>;
  getActive(): Promise<string | undefined>;
  setActive(name: string): Promise<void>;
}

export class ProcedureManager extends EventEmitter implements ProcedureManagerType {

  constructor() {
    super();
  }

  static PROCEDURES_JSON_FILE_NAME = 'procedures.json';

  static PROCEDURE_LOGIC_FOLDER_NAME = 'logic';
  static PROCEDURE_JSON_FILE_NAME = 'procedure.json';
 
  emit(event: EventNames | symbol, ...args: any[]): boolean {
    return super.emit(event, args);
  }

  getProcedureDirPath(name: string) {
    const procDir = path.join(global.visualCal.dirs.procedures, name);
    return procDir;
  };
  
  procedureDirExists() { return fs.existsSync(global.visualCal.dirs.procedures); };

  async createProcedureDir() { await fsPromises.mkdir(global.visualCal.dirs.procedures); };
  
  async saveProceduresJson(content?: ProceduresFile) { await fsPromises.writeFile(global.visualCal.files.proceduresJson, JSON.stringify(content)); };
  async createProceduresJson() { await this.saveProceduresJson({}); };

  async getProceduresJson(){
    const fileBuffer = await fsPromises.readFile(global.visualCal.files.proceduresJson);
    const fileContent = fileBuffer.toString();
    const procsJson = JSON.parse(fileContent) as ProceduresFile;
    return procsJson;
  };
  
  async saveProcedureJson(name: string, proc: ProcedureFile) {
    const procFilePath = path.join(this.getProcedureDirPath(name), ProcedureManager.PROCEDURE_JSON_FILE_NAME);
    const procContent = JSON.stringify(proc);
    await fsPromises.writeFile(procFilePath, procContent);
  };

  async getProcedureJson(name: string) {
    const procedureJsonFilePath = path.join(this.getProcedureDirPath(name), ProcedureManager.PROCEDURE_JSON_FILE_NAME);
    const fileJson = await fsPromises.readFile(procedureJsonFilePath);
    const procFile = JSON.parse((fileJson).toString()) as ProcedureFile;
    return procFile;
  };
  
  exists(name: string, shouldExist: boolean = true) {
    console.debug(`Check if procedure directory exists for procedure "${name}"`);
    const procedureDirPath = this.getProcedureDirPath(name);
    console.debug(`Checking procedure directory path for procedure ${procedureDirPath}`);
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
    const procDirPath = this.getProcedureDirPath(name);
    // const sectionsDirPath = path.join(procDirPath, 'sections');
    const procInfoFilePath = path.join(procDirPath, 'procedure.json');
    const procInfo = JSON.parse((await fsPromises.readFile(procInfoFilePath)).toString()) as Procedure;
    return procInfo;
  }
  
  getAll = async () => {
    if (!this.procedureDirExists()) return [];
    const proceduresDirNames = (await fsPromises.readdir(global.visualCal.dirs.procedures, { withFileTypes: true })).filter(dir => dir.isDirectory() && dir.name !== 'logic').map(dir => dir.name);
    const retVal: Procedure[] = [];
    for (const procDirName of proceduresDirNames) {
      const proc = await this.getOne(procDirName);
      if (proc) retVal.push(proc);
    }
    return retVal;
  }
  
  create = async (procedure: CreateProcedureInfo) => {
    const sanitizedName = sanitizeFilename(procedure.name);
    this.checkNotExists(sanitizedName);
    if (!this.procedureDirExists()) await this.createProcedureDir();
    const procDirPath = this.getProcedureDirPath(sanitizedName);
    if (!this.exists(sanitizedName)) await fsPromises.mkdir(procDirPath);
    await this.saveProcedureJson(procedure.name, procedure);
    const retVal: CreatedProcedureInfo = {
      ...procedure
    };
    this.emit('created', retVal);
    return retVal;
  }
  remove = async (name: string)  => {
    this.checkExists(name);
    const procPath = this.getProcedureDirPath(name);
    await fsPromises.rmdir(procPath, { recursive: true });
    this.emit('removed', name);
  }
  
  async rename(oldName: string, newName: string) {
    console.info('Renaming procedure');
    console.info('Procedure orignal name: ' + oldName);
    console.info('Procedure new name: ' + newName);
    const oldNameSanitized = sanitizeFilename(oldName);
    const newNameSanitized = sanitizeFilename(newName);
    console.info('Procedure sanitized name: ' + oldNameSanitized);
    console.info('Procedure new sanitized name: ' + newNameSanitized);
    this.checkExists(oldNameSanitized);
    this.checkNotExists(newNameSanitized);
    const oldDirPath = this.getProcedureDirPath(oldNameSanitized);
    const newDirPath = this.getProcedureDirPath(newNameSanitized);
    console.info('Procedure old path: ' + oldDirPath);
    console.info('Procedure new path: ' + newDirPath);
    const procJson = await this.getProcedureJson(oldName);
    console.info('New procedure JSON: ' + procJson);
    procJson.name = newName;
    console.info('Saving new procedure JSON');
    await this.saveProcedureJson(oldName, procJson);
    console.info('Saved new procedure JSON');
    console.info('Renaming procedure directory');
    await fsPromises.rename(oldDirPath, newDirPath);
    console.info('Renamed procedure directory');
    this.emit('renamed', { oldName, newName });
    return procJson;
  }
  
  async getActive() {
    if (!fs.existsSync(global.visualCal.files.proceduresJson)) return undefined;
    const procsJson = await this.getProceduresJson();
    return procsJson.active;
  }
  
  async setActive(name: string) {
    this.checkExists(name);
    if (!fs.existsSync(global.visualCal.files.proceduresJson)) await this.createProceduresJson();
    const procsJson = await this.getProceduresJson();
    procsJson.active = name;
    await this.saveProceduresJson(procsJson);
    this.emit('set-active', name);
  }

}