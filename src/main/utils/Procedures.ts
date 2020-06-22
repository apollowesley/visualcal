import fs, { promises as fsPromises } from 'fs';
import path from 'path';

export const getPath = (name: string) => path.join(global.visualCal.dirs.procedures, name);
export const procedureDirExists = () => fs.existsSync(global.visualCal.dirs.procedures);
export const createProcedureDir = async () => await fsPromises.mkdir(global.visualCal.dirs.procedures);
export const exists = (name: string) => fs.existsSync(getPath(name));

export const getAll = async () => {
  const proceduresDir = (await fsPromises.readdir(global.visualCal.dirs.procedures, { withFileTypes: true })).filter(dir => dir.isDirectory());
  const retVal: Procedure[] = [];
  if (!procedureDirExists()) return retVal;
  proceduresDir.forEach(async (dir) => {
    const infoFilePath = path.join(getPath(dir.name), 'procedure.json');
    if (fs.existsSync(infoFilePath)) {
      const fileBuffer = (await fsPromises.readFile(infoFilePath)).toString();
      const info = JSON.parse(fileBuffer) as Procedure;
      retVal.push(info);
    }
  });
  return retVal;
}

export const getOne = async (name: string) => {
  if (!exists(name)) return undefined;
  const procDirPath = getPath(name);
  // const sectionsDirPath = path.join(procDirPath, 'sections');
  const procInfoFilePath = path.join(procDirPath, 'procedure.json');
  const procInfo = JSON.parse((await fsPromises.readFile(procInfoFilePath)).toString()) as Procedure;
  return procInfo;
}

export const create = async (procedure: Procedure) => {
  if (exists(procedure.name)) throw new Error(`Procedure, ${procedure.name}, already exists`);
  if (!procedureDirExists()) await createProcedureDir();
  const procDirPath = getPath(procedure.name);
  if (!exists(procedure.name)) await fsPromises.mkdir(procDirPath);
  const sectionsDirPath = path.join(procDirPath, 'sections');
  const procInfoFilePath = path.join(procDirPath, 'procedure.json');
  await fsPromises.writeFile(procInfoFilePath, JSON.stringify(procedure));
  if (procedure.sections && procedure.sections.length > 0) {
    await fsPromises.mkdir(sectionsDirPath);
    procedure.sections.forEach(async (section) => {
      const sectionDirPath = path.join(sectionsDirPath, section.name);
      const sectionInfoFilePath = path.join(sectionDirPath, 'section.json');
      await fsPromises.mkdir(sectionDirPath);
      await fsPromises.writeFile(sectionInfoFilePath, JSON.stringify(section));
    });
  }
}
export const remove = async (name: string)  => {
  if (!exists(name)) throw new Error(`Procedure, ${name}, does not exist`);
  const procPath = getPath(name);
  await fsPromises.rmdir(procPath, { recursive: true });
}

export const rename = async (oldName: string, newName: string) => {
  if (!exists(oldName)) throw new Error(`Procedure, ${oldName}, does not exist`);
  if (exists(newName)) throw new Error(`Procedure, ${newName}, already exists`);
  const oldPath = getPath(oldName);
  const newPath = getPath(newName);
  await fsPromises.rename(oldPath, newPath);
}
