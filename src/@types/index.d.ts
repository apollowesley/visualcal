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
  view?: string;
  remove?: string;
}

interface VisualCalAugmentDirs {
  base: string;
  public: string;
  html: {
    windows: string;
    views: string;
    css: string;
    js: string;
    fonts: string;
    bootstrapStudio: string;
    procedure: VisualCalCRUDDir;
    session: VisualCalCRUDDir;
    userAction: string;
    createCommIface: string;
  },
  renderers: {
    base: string;
    windows: string;
    views: string;
    nodeRed: string;
    procedure: VisualCalCRUDDir;
    session: VisualCalCRUDDir;
  }
  drivers: {
    base: string;
    communicationInterfaces: string;
    devices: string;
  }
  userHomeData: {
    base: string;
    procedures: string;
    sessions: string;
  }
}

interface VisualCalAugmentFiles {
  proceduresJson: string;
  sessionsJson: string;
}

interface VisualCalAugment {
  isDev: boolean,
  isMac: boolean,
  config: VisualCalConfig;
  log: {
    result(result: LogicResult): void;
    info(msg: any, ...args: any[]): void;
    warn(msg: any, ...args: any[]): void;
    error(msg: any, ...args: any[]): void;
  };
  user?: User;
}

interface NodeRedUtils {
  actions: {
    trigger: (section: string, action: string) => void;
    stop: (section: string, action: string) => void;
    reset: (section: string, action: string) => void;
  };
  nodes: {
    find: (name: string) => import('./logic-server').NodeRedRuntimeNode | undefined;
  }
}

interface VisualCalGlobalAugment extends VisualCalAugment {
  logger: import('winston').Logger;
  windowManager: import('../main/managers/WindowManager').WindowManager;
  procedureManager: import('../main/managers/ProcedureManager').ProcedureManager;
  sessionManager: import('../main/managers/SessionManager').SessionManager;
  nodeRedFlowManager: import('../main/managers/NodeRedFlowManager').NodeRedFlowManager;
  resultManager: import('../main/managers/ResultManager').ResultManager;
  actionManager: import('../main/managers/ActionManager').ActionManager;
  userInteractionManager: import('../main/managers/UserInteractionManager').UserInteractionManager;
  assetManager: import('../main/managers/AssetManager').AssetManager;
  dirs: VisualCalAugmentDirs;
  files: VisualCalAugmentFiles;
  nodeRed: {
    app: import('./logic-server').NodeRed;
  };
}

interface VisualCalWindowAugment extends VisualCalAugment {
  browserUtils: VisualCalBrowserUtils;
  electron: {
    ipc: import('electron').IpcRenderer;
    getVisualCalWindowId: () => void;
    showWindow: (windowId: VisualCalWindow) => void;
    showViewSessionWindow: (sessionName: string) => void;
    showErrorDialog: (error: Error) => void;
    showCreateCommIfaceWindow: (sessionName: string) => void;
  };
  sessionManager: import('../renderers/managers/RendererSessionManager').RendererSessionManager;
  resultsManager: import('../renderers/managers/RendererResultManager').RendererResultManager;
  actionManager: import('../renderers/managers/RendererActionManager').RendererActionManager;
  procedureManager: import('../renderers/managers/RendererProcedureManager').RendererProcedureManager;
  assetManager: import('../renderers/managers/RendererAssetManager').RendererAssetManager;
}

interface NamedType {
  name: string;
}
