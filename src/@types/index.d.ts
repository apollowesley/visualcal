interface CreateWindowOptions extends VisualCalWindowOptions {
  config?: import('electron').BrowserWindowConstructorOptions;
}

declare type TreeItemType = 'procedure' | 'procedure-section';

interface TreeItem {
  name: string;
  type: TreeItemType;
  children?: TreeItem[];
}

interface VisualCalGlobalDirs {
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
  },
  renderers: {
    base: string;
    windows: string;
    views: string;
    nodeBrowser: string;
  }
  procedures: string;
  visualCalUser: string;
}

interface VisualCalGlobalProcedures {
  getAll(): Promise<Procedure[]>;
  getOne(name: string): Promise<Procedure | undefined>;
  create(info: CreateProcedureInfo): Promise<CreatedProcedureInfo>;
  remove(name: string): Promise<void>;
  exists(name: string): Promise<boolean>;
  rename(oldName: string, newName: string): Promise<void>;
}

interface VisualCalGlobal {
  isDev: boolean,
  isMac: boolean,
  browserUtils?: VisualCalBrowserUtils;
  config: VisualCalConfig;
  logger: import('winston').Logger;
  log: {
    result(result: LogicResult): void;
  };
  procedures: VisualCalGlobalProcedures;
  assets: {
    basePath: string;
    get: (id: string) => Buffer;
  };
  electron: {
    ipc: import('electron').IpcRenderer;
    getVisualCalWindowId: () => void;
  };
  dirs: VisualCalGlobalDirs;
  windowManager: import('../main/managers/WindowManager').WindowManager;
  user?: User;
}
