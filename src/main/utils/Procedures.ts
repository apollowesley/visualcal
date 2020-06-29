import fs, { promises as fsPromises } from 'fs';
import path from 'path';
import sanitizeFilename from 'sanitize-filename';

export const PROCEDURE_LOGIC_FOLDER_NAME = 'logic';
export const PROCEDURE_JSON_FILE_NAME = 'procedure.json';

export const PROCEDURES_FOLDDER_NAME = 'procedures';
export const PROCEDURES_JSON_FILE_NAME = 'procedures.json';

export const getProcedureDirPath = (name: string) => {
  const procDir = path.join(global.visualCal.dirs.procedures, name);
  return procDir;
};

export const procedureDirExists = () => fs.existsSync(global.visualCal.dirs.procedures);
export const createProcedureDir = async () => await fsPromises.mkdir(global.visualCal.dirs.procedures);

export const saveProceduresJson = async (content?: ProceduresFile) => await fsPromises.writeFile(global.visualCal.files.proceduresJson, JSON.stringify(content));
export const createProceduresJson = async () => await saveProceduresJson({});
export const getProceduresJson = async () => {
  const fileBuffer = await fsPromises.readFile(global.visualCal.files.proceduresJson);
  const fileContent = fileBuffer.toString();
  const procsJson = JSON.parse(fileContent) as ProceduresFile;
  return procsJson;
};

export const saveProcedureJson = async (name: string, content: ProcedureFile) => {
  try {
    const procFilePath = path.join(getProcedureDirPath(name), PROCEDURE_JSON_FILE_NAME);
    const procContent = JSON.stringify(content);
    await fsPromises.writeFile(procFilePath, procContent);
  } catch (error) {
    throw error;
  }
};
export const createProcedureJson = async (proc: ProcedureFile) => await saveProcedureJson(sanitizeFilename(proc.name) ,proc);
export const getProcedureJson = async (name: string) => {
  const procedureJsonFilePath = path.join(getProcedureDirPath(name), PROCEDURE_JSON_FILE_NAME);
  const fileJson = await fsPromises.readFile(procedureJsonFilePath);
  return JSON.parse((fileJson).toString()) as ProcedureFile;
};

export const exists = (name: string, shouldExist: boolean = true) => {
  console.debug(`Check if procedure directory exists for procedure "${name}"`);
  const procedureDirPath = getProcedureDirPath(name);
  console.debug(`Checking procedure directory path for procedure ${procedureDirPath}`);
  const doesExist = fs.existsSync(procedureDirPath);
  return doesExist && shouldExist;
}

const checkExists = (name: string) => {
  if (!exists(name, true)) throw new Error(`Procedure directory, ${name}, does not exist`);
}

const checkNotExists = (name: string) => {
  if (exists(name, false)) throw new Error(`Procedure directory, ${name}, already exists`);
}

export const getOne = async (name: string) => {
  if (!exists(name)) return undefined;
  const procDirPath = getProcedureDirPath(name);
  // const sectionsDirPath = path.join(procDirPath, 'sections');
  const procInfoFilePath = path.join(procDirPath, 'procedure.json');
  const procInfo = JSON.parse((await fsPromises.readFile(procInfoFilePath)).toString()) as Procedure;
  return procInfo;
}

export const getAll = async () => {
  if (!procedureDirExists()) return [];
  const proceduresDirNames = (await fsPromises.readdir(global.visualCal.dirs.procedures, { withFileTypes: true })).filter(dir => dir.isDirectory() && dir.name !== 'logic').map(dir => dir.name);
  const retVal: Procedure[] = [];
  for (const procDirName of proceduresDirNames) {
    const proc = await getOne(procDirName);
    if (proc) retVal.push(proc);
  }
  return retVal;
}

export const create = async (procedure: CreateProcedureInfo) => {
  const sanitizedName = sanitizeFilename(procedure.name);
  checkNotExists(sanitizedName);
  if (!procedureDirExists()) await createProcedureDir();
  const procDirPath = getProcedureDirPath(sanitizedName);
  if (!exists(sanitizedName)) await fsPromises.mkdir(procDirPath);
  const procInfoFilePath = path.join(procDirPath, 'procedure.json');
  await fsPromises.writeFile(procInfoFilePath, JSON.stringify(procedure));
  const retVal: CreatedProcedureInfo = {
    name: procedure.name
  };
  return retVal;
}
export const remove = async (name: string)  => {
  checkExists(name);
  const procPath = getProcedureDirPath(name);
  await fsPromises.rmdir(procPath, { recursive: true });
}

export const rename = async (oldName: string, newName: string) => {
  console.info('Renaming procedure');
  console.info('Procedure orignal name: ' + oldName);
  console.info('Procedure new name: ' + newName);
  const oldNameSanitized = sanitizeFilename(oldName);
  const newNameSanitized = sanitizeFilename(newName);
  console.info('Procedure sanitized name: ' + oldNameSanitized);
  console.info('Procedure new sanitized name: ' + newNameSanitized);
  checkExists(oldNameSanitized);
  checkNotExists(newNameSanitized);
  const oldDirPath = getProcedureDirPath(oldNameSanitized);
  const newDirPath = getProcedureDirPath(newNameSanitized);
  console.info('Procedure old path: ' + oldDirPath);
  console.info('Procedure new path: ' + newDirPath);
  const procJson = await getProcedureJson(oldName);
  console.info('New procedure JSON: ' + procJson);
  procJson.name = newName;
  console.info('Saving new procedure JSON');
  await saveProcedureJson(oldName, procJson);
  console.info('Saved new procedure JSON');
  console.info('Renaming procedure directory');
  await fsPromises.rename(oldDirPath, newDirPath);
  console.info('Renamed procedure directory');
  return procJson;
}

export const getActive = async () => {
  if (!fs.existsSync(global.visualCal.files.proceduresJson)) return undefined;
  const procsJson = await getProceduresJson();
  return procsJson.active;
}

export const setActive = async (name: string) => {
  checkExists(name);
  if (!fs.existsSync(global.visualCal.files.proceduresJson)) await createProceduresJson();
  const procsJson = await getProceduresJson();
  procsJson.active = name;
  await saveProceduresJson(procsJson);
}
