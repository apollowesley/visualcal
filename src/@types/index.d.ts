interface CreateWindowOptions extends VisualCalWindowOptions {
  config?: import('electron').BrowserWindowConstructorOptions;
}

declare type TreeItemType = 'procedure' | 'procedure-section';

interface TreeItem {
  name: string;
  type: TreeItemType;
  children?: TreeItem[];
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

interface VisualCalAugmentFiles {
  proceduresJson: string;
}

interface VisualCalAugmentProcedures {
  getAll(): Promise<Procedure[]>;
  getOne(name: string): Promise<Procedure | undefined>;
  create(info: CreateProcedureInfo): Promise<CreatedProcedureInfo>;
  onCreated(info: CreatedProcedureInfo): void;
  remove(name: string): Promise<void>;
  onRemoved(name: string): void;
  exists(name: string): boolean;
  rename(oldName: string, newName: string): Promise<ProcedureFile>;
  onRenamed(oldName: string, newName: string): void;
  getActive(): Promise<string | undefined>;
  setActive(name: string): Promise<void>;
}

interface VisualCalAugment {
  isDev: boolean,
  isMac: boolean,
  config: VisualCalConfig;
  log: {
    result(result: LogicResult): void;
  };
  procedureManager: import('../main/managers/ProcedureManager').ProcedureManagerType;
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
}

interface VisualCalWindowAugment extends VisualCalAugment {
  browserUtils?: VisualCalBrowserUtils;
  electron: {
    ipc: import('electron').IpcRenderer;
    getVisualCalWindowId: () => void;
  };
}