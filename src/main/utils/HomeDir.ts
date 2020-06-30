import fs, { promises as fsPromises } from 'fs';
import fsExtra from 'fs-extra';
import path from 'path';
import { exists as configExists, save as saveConfig } from './UserConfig';

const demoDir = path.resolve(__dirname, '..', '..', '..', 'demo');
// const demoProceduresDir = path.join(demoDir, 'procedures');
// const demoSessionsDir = path.join(demoDir, 'sessions');

export const ensureExists = () => {
  if (fs.existsSync(global.visualCal.dirs.visualCalUser)) return;
  fs.mkdir(global.visualCal.dirs.visualCalUser, { recursive: true }, (err) => {
    if (err) throw err;
    fsExtra.copy(demoDir, global.visualCal.dirs.visualCalUser, { recursive: true }).then(() => {
      if (!configExists) saveConfig(); // Only save if it doesn't exist.  We can call saveConfg, explicitly, at any time.
    });
  });
}
