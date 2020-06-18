import fs from 'fs-extra';
import path from 'path';
import { exists as configExists, save as saveConfig } from './UserConfig';

export const ensureExists = async () => {
  if (!fs.existsSync(global.visualCal.dirs.visualCalUser)) await fs.mkdir(global.visualCal.dirs.visualCalUser);
  await ensureProceduresDirExists();
  if (!configExists) await saveConfig(); // Only save if it doesn't exist.  We can call saveConfg, explicitly, at any time.
}

export const ensureProceduresDirExists = async () => {
  const procDir = path.join(global.visualCal.dirs.visualCalUser, 'procedures');
  if (!fs.existsSync(procDir)) await fs.mkdir(procDir);
}
