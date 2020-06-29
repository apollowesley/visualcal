interface CreateWindowOptions extends VisualCalWindowOptions {
  config?: import('electron').BrowserWindowConstructorOptions;
}

declare type TreeItemType = 'procedure' | 'procedure-section';

interface TreeItem {
  name: string;
  type: TreeItemType;
  children?: TreeItem[];
}

interface VisualCalCRUDDir {
  create: string;
  edit: string;
  remove?: string;
}

interface VisualCalAugmentDirs {
  base: string;
  html: {
    getWindowInfo: (id: VisualCalWindow) => WindowInfo;
    vue: string;
    windows: string;
    views: string;
    css: string;
    js: string;
    fonts: string;
    bootstrapStudio: string;
    procedure: VisualCalCRUDDir
  },
  renderers: {
    base: string;
    windows: string;
    views: string;
    nodeBrowser: string;
    procedure: VisualCalCRUDDir
  }
  procedures: string;
  visualCalUser: string;
}

interface VisualCalAugmentFiles {
  proceduresJson: string;
}

interface VisualCalAugment {
  isDev: boolean,
  isMac: boolean,
  config: VisualCalConfig;
  log: {
    result(result: LogicResult): void;
  };
  assets: {
    basePath: string;
    get: (id: string) => Buffer;
  };
  dirs: VisualCalAugmentDirs;
  files: VisualCalAugmentFiles;
  user?: User;
}

interface VisualCalGlobalAugment extends VisualCalAugment {
  logger: import('winston').Logger;
  windowManager: import('../main/managers/WindowManager').WindowManager;
  procedureManager: import('../main/managers/ProcedureManager').ProcedureManagerType;
}

interface VisualCalWindowAugment extends VisualCalAugment {
  browserUtils?: VisualCalBrowserUtils;
  electron: {
    ipc: import('electron').IpcRenderer;
    getVisualCalWindowId: () => void;
    showWindow: (windowId: VisualCalWindow) => void;
  };
  procedureManager: import('../renderers/managers/RendererProcedureManager').RendererProcedureManagerType;
}