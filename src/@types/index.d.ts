type HtmlPathType = 'bootstrap' | 'public' | 'url' | 'raw';

interface CreateWindowOptions extends VisualCalWindowOptions {
  browserWindow?: import('electron').BrowserWindowConstructorOptions;
  autoCenter?: boolean;
  openOnMouseCursorScreen?: boolean;
  openHidden?: boolean;
  htmlPath: string;
  htmlPathType: HtmlPathType;
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

interface VisualCalCRUDViewDir {
  create: string;
  edit: string;
  view: string;
  remove?: string;
}

interface VisualCalAugmentDirs {
  base: string;
  dist: string,
  nodes: string,
  public: string;
  html: {
    windows: string;
    views: string;
    css: string;
    js: string;
    fonts: string;
    bootstrapStudio: string;
    procedure: VisualCalCRUDDir;
    session: VisualCalCRUDViewDir;
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
    info(msg: any, ...args: any[]): void;
    warn(msg: any, ...args: any[]): void;
    error(msg: any, ...args: any[]): void;
  };
}

interface VisualCalGlobalAugment extends VisualCalAugment {
  procedureManager: import('../main/managers/ProcedureManager').ProcedureManager;
  sessionManager: import('../main/managers/SessionManager').SessionManager;
  actionManager: import('../main/managers/ActionManager').ActionManager;
  userInteractionManager: import('../main/managers/UserInteractionManager').UserInteractionManager;
  assetManager: import('../main/managers/AssetManager').AssetManager;
  userManager: import('../main/managers/UserManager').UserManager;
  dirs: VisualCalAugmentDirs;
  files: VisualCalAugmentFiles;
}

interface VisualCalWindowAugment extends VisualCalAugment {
  windowId?: VisualCalWindow;
  initialLoadData?: VisualCalWindowInitialLoadData,
  onInitialLoadData?: (data: VisualCalWindowInitialLoadData) => void;
  browserUtils: VisualCalBrowserUtils;
  getCustomDriver: (manufacturer: string, model: string) => Promise<import('visualcal-common/dist/driver-builder').Driver | undefined>;
  getCustomDriverIdentityInfos: () => Promise<{ manufactuer: string, model: string, nomenclature: string }[]>;
  getDriverCategories: () => Promise<{ _id: string, name: string, instructionSets: string[] }[]>;
  electron: {
    ipc: import('electron').IpcRenderer;
    getVisualCalWindowId: () => void;
    showWindow: (id: VisualCalWindow) => void;
    showViewSessionWindow: (sessionName: string) => void;
    showErrorDialog: (error: Error) => void;
    showCreateCommIfaceWindow: () => void;
    showOpenFileDialog: (opts: import('electron').OpenDialogOptions) => void;
    showSaveFileDialog: (opts: import('electron').SaveDialogOptions) => void;
    quit: () => void;
  };
  sessionManager: import('../renderers/managers/RendererSessionManager').RendererSessionManager;
  runsManager: import('../renderers/managers/RendererRunManager').RendererRunManager;
  actionManager: import('../renderers/managers/RendererActionManager').RendererActionManager;
  procedureManager: import('../renderers/managers/RendererProcedureManager').RendererProcedureManager;
  assetManager: import('../renderers/managers/RendererAssetManager').RendererAssetManager;
  userManager: import('../renderers/managers/RendererUserManager').RendererUserManager;
}

interface NamedType {
  name: string;
}

interface VisualCalWindowInitialLoadData {
  windowId: VisualCalWindow;
  user?: User;
  session?: Session;
  procedure?: Procedure;
  sections?: SectionInfo[];
}
