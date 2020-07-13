declare module '@hashedin/electron-manager' {

  export interface LoggerConfig {
    cleanLogs?: boolean;
    logFolderPath?: string;
    logPeriod?: number;
    setFileHeader?: boolean;
    writeToFile?: boolean;
    handleLocalConsole?: boolean;

  }

  export interface Logger {
    init: (config?: LoggerConfig) => void;
    error: (...args: any) => void;
    info: (...args: any) => void;
    log: (...args: any) => void;
    warn: (...args: any) => void;

  }

  export interface ShowCustomMessageBoxCallback {
    (checkboxChecked: boolean): void;
  }

  export interface Dialog {
    /**
    * @function init
    * @param {Object} config - Dialog initial configurations
    * @description Initialize Dialog module
    */
    init: (config?: object) => void;
    showCustomMessageBox: (parentWindowRef: import('electron').BrowserWindow, options?: import('electron').OpenDialogOptions, ...args: ShowCustomMessageBoxCallback) => void;
  }

  export interface Config {
    isDev?: boolean;
  }

  export default {
    init(config?: Config): void;
  }

  export const logger: Logger;

}
