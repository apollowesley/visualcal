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
