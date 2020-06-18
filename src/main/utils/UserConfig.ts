import fs from 'fs-extra';
import path from 'path';

export interface UserConfig {
  showSplash: boolean;
  lastProcedure?: string;
}

const getConfigFilePath = () => {
  return path.join(global.visualCal.dirs.visualCalUser, 'config.json');
}

export const exists = () => fs.existsSync(getConfigFilePath());

let config: UserConfig = {
  showSplash: true
}

export const getConfig = () => config;

export const save = async () => {
  const filePath = getConfigFilePath();
  await fs.writeJson(filePath, config, { spaces: 2 });
}

export const load = async () => {
  const filePath = getConfigFilePath();
  config = await fs.readJson(filePath);
}
