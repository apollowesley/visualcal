/**
 * Are we currently running in development mode?
 *
 * @returns {boolean}
 */
export function isDev(): boolean {
  return !!process.defaultApp;
}
