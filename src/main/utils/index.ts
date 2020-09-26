import path from 'path';

/**
 * Are we currently running in development mode?
 *
 * @returns {boolean}
 */
export function isDev(): boolean {
  return !!process.defaultApp;
}

export function isMac() {
  return process.platform === 'darwin';
}

export const getUserHomeDataPathDir = (currentDir: string) => {
  if (isDev()) return path.join(__dirname, '..', '..', 'demo');
  return currentDir;
}
