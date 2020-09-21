import { app, BrowserWindow, BrowserWindowConstructorOptions, dialog, ipcMain, OpenDialogOptions, SaveDialogOptions, WebContents } from 'electron';
import SerialPort from 'serialport';
import { TypedEmitter } from 'tiny-typed-emitter';
import { CommunicationInterfaceTypes, IpcChannels, VisualCalWindow } from '../../../constants';
import * as WindowUtils from '../../utils/Window';
import { getConfig as getWindowConfig } from './WindowConfigs';
import electronLog from 'electron-log';
import visualCalNodeRed from '../../node-red';
import { getSubPath, defaultWindowConstructorOptions, coerceWindowConstructorOptions, setWindowSize, getWindowTitle } from './vue-helper';
import { isDev } from '../../utils/is-dev-mode';
import { ExpressServer } from '../../servers/express';
import VisualCalNodeRedSettings from '../../node-red-settings';

const nodeRed = visualCalNodeRed();
const log = electronLog.scope('WindowManager');

interface Events {
  windowCreated: (id: VisualCalWindow, browserWindow: BrowserWindow) => void;
  windowShown: (id: VisualCalWindow, browserWindow: BrowserWindow) => void;
  windowClosed: (id: VisualCalWindow) => void;
  windowAdded: (id: VisualCalWindow) => void;
  windowRemoved: (id: VisualCalWindow) => void;
  allWindowsClosed: () => void;
}

export class WindowManager extends TypedEmitter<Events> {

  private fWindows: Set<BrowserWindow>;

  constructor() {
    super();
    this.fWindows = new Set<BrowserWindow>();
    ipcMain.on(IpcChannels.windows.getMyId.request, (event) => {
      try {
        const browserWindow = BrowserWindow.fromWebContents(event.sender);
        if (!browserWindow) {
          event.reply(IpcChannels.windows.getMyId.response, -1);
        } else {
          event.reply(IpcChannels.windows.getMyId.response, browserWindow.visualCal.id);
        }
      } catch (error) {
        event.reply(IpcChannels.windows.getMyId.error, error);
      }
    });
    ipcMain.on(IpcChannels.windows.show, async (_, id: VisualCalWindow) => {
      switch (id) {
        case VisualCalWindow.Console:
          await this.ShowConsole();
          break;
        case VisualCalWindow.CreateProcedure:
          await this.ShowCreateProcedureWindow();
          break;
        case VisualCalWindow.CreateSession:
          await this.ShowCreateSessionWindow();
          break;
      }
    });

    ipcMain.on(IpcChannels.windows.showViewSession, async () => {
      await this.ShowMain();
    });

    ipcMain.on(IpcChannels.windows.showCreateCommIface, (_, sessionName: string) => this.showCreateCommIfaceWindow(sessionName));
    ipcMain.on(IpcChannels.windows.showOpenFileDialog.request, (event, opts: OpenDialogOptions) => {
      const browserWindow = BrowserWindow.fromId(event.sender.id);
      const result = dialog.showOpenDialogSync(browserWindow, opts);
      event.reply(IpcChannels.windows.showOpenFileDialog.response, result);
    });

    ipcMain.on(IpcChannels.windows.showSaveFileDialog.request, (event, opts: SaveDialogOptions) => {
      const browserWindow = BrowserWindow.fromId(event.sender.id);
      const result = dialog.showSaveDialogSync(browserWindow, opts);
      event.reply(IpcChannels.windows.showSaveFileDialog.response, result);
    });

    ipcMain.on(IpcChannels.windows.showErrorDialog, (_, error: Error) => {
      dialog.showErrorBox('An error has occured', error.message);
    });

    ipcMain.on(IpcChannels.windows.showCreateProcedure, async () => {
      await this.ShowCreateProcedureWindow();
      this.closeAllBut(VisualCalWindow.CreateProcedure);
    });

    ipcMain.on(IpcChannels.windows.showCreateSession, async () => {
      await this.ShowCreateSessionWindow();
      this.closeAllBut(VisualCalWindow.CreateSession);
    });

    ipcMain.on(IpcChannels.procedures.cancelSelect, () => app.quit());

    ipcMain.on(IpcChannels.procedures.cancelCreate, () => {
      this.close(VisualCalWindow.CreateProcedure);
    });

    ipcMain.on(IpcChannels.session.cancelCreate, async () => {
      await this.showSelectProcedureWindow();
      this.closeAllBut(VisualCalWindow.SelectProcedure);
    });

    ipcMain.on(IpcChannels.session.cancelSelect, () => {
      this.close(VisualCalWindow.CreateSession);
    });
  }

  get(id: VisualCalWindow) {
    const browserWindow = Array.from(this.fWindows).find(w => w.visualCal.id === id);
    if (browserWindow && !browserWindow.isDestroyed()) return browserWindow;
    return undefined;
  }

  get loadingWindow() { return this.get(VisualCalWindow.Loading); }
  get loginWindow() { return this.get(VisualCalWindow.Login); }
  get mainWindow() { return this.get(VisualCalWindow.Main); }
  get consoleWindow() { return this.get(VisualCalWindow.Console); }
  get nodeRedEditorWindow() { return this.get(VisualCalWindow.NodeRedEditor); }
  get createProcedureWindow() { return this.get(VisualCalWindow.CreateProcedure); }
  get createSessionWindow() { return this.get(VisualCalWindow.CreateSession); }
  get userInputWindow() { return this.get(VisualCalWindow.UserInput); }
  get createCommIfaceWindow() { return this.get(VisualCalWindow.CreateCommInterface); }
  get interactiveDeviceControlWindow() { return this.get(VisualCalWindow.InteractiveDeviceControl); }
  get selectProcedureWindow() { return this.get(VisualCalWindow.SelectProcedure); }
  get updateAppWindow() { return this.get(VisualCalWindow.UpdateApp); }
  get benchConfigViewWindow() { return this.get(VisualCalWindow.BenchConfigView); }
  get deviceBeforeWriteWindow() { return this.get(VisualCalWindow.DeviceBeforeWrite); }
  get vueTestWindow() { return this.get(VisualCalWindow.DeviceBeforeWrite); }

  isWindowLoaded(id: VisualCalWindow) {
    const exists = Array.from(this.fWindows).find(w => w.visualCal.id === id) !== undefined;
    return exists;
  }

  private checkWindowExists(id: VisualCalWindow) {
    const exists = this.isWindowLoaded(id);
    if (exists) throw new Error(`Duplicate window Id, ${id}`);
  }

  add(browserWindow: BrowserWindow, id?: VisualCalWindow) {
    if (id) browserWindow.visualCal = { id: id };
    log.info('Adding window', { windowId: browserWindow.visualCal.id });
    if (!browserWindow.visualCal || !browserWindow.visualCal.id) throw new Error(`Attempting to add a BrowserWindow without a VisualCal.id or an unused BrowserWindow detected with ID, ${browserWindow.visualCal.id}`);
    this.checkWindowExists(browserWindow.visualCal.id);
    this.fWindows.add(browserWindow);
    browserWindow.once('closed', () => this.onWindowClosed(browserWindow.visualCal.id));
    this.emit('windowAdded', browserWindow.visualCal.id);
  }

  remove(id: VisualCalWindow) {
    log.info('Removing window', { windowId: id });
    const existing = Array.from(this.fWindows).find(w => w.visualCal.id === id);
    if (!existing) return;
    this.fWindows.delete(existing);
    log.info('Window removed', { windowId: id });
    this.emit('windowRemoved', id);
  }

  private onWindowClosed(id: VisualCalWindow) {
    log.info('Window closed', { windowId: id });
    this.remove(id);
    this.emit('windowClosed', id);
  }

  close(id: VisualCalWindow) {
    log.info('Closing window', { windowId: id });
    const browserWindow = this.get(id);
    if (!browserWindow) log.warn(`Attempt to close window, ${id}, but it wasn\'t open`);
    if (browserWindow) browserWindow.close();
  };

  changeVisiblity(id: VisualCalWindow, show: boolean = true) {
    log.info('Changing window visiblity', { windowId: id, show: show });
    const browserWindow = this.get(id);
    if (!browserWindow) throw new Error(`Window not found, ${id}`);
    if (show) browserWindow.show();
    else browserWindow.hide();
  }

  closeAllBut(id: VisualCalWindow) {
    this.fWindows.forEach(browserWindow => {
      if (browserWindow.visualCal.id === id) return;
      this.close(browserWindow.visualCal.id);
    });
  }

  closeAll() {
    this.fWindows.forEach(browserWindow => this.close(browserWindow.visualCal.id));
    this.emit('allWindowsClosed');
    this.fWindows.clear();
  }

  // *********************************************************
  // ************** CREATE/SHOW WINDOWS/DIALOGS **************
  // *********************************************************

  async showErrorDialog(parentWebContents: WebContents, error: Error) {
    const parent = BrowserWindow.fromWebContents(parentWebContents);
    if (!parent) throw new Error('Unable to find BrowserWindow from WebContents');
    dialog.showErrorBox('Error', error.message);
  }

  private createBrowserWindow(options: CreateWindowOptions) {
    log.info('Creating window', { windowId: options.id });
    this.checkWindowExists(options.id);
    const newWindow = new BrowserWindow(options.browserWindow);
    this.emit('windowCreated', options.id, newWindow);
    newWindow.visualCal = {
      id: options.id
    };
    this.add(newWindow);
    return newWindow;
  }

  async createWindow(id: VisualCalWindow, parent?: BrowserWindow, maximize: boolean = false, onShow?: (bw: BrowserWindow) => void, onClosed?: () => void, onWebContentsDidFinishLoading?: (bw: BrowserWindow) => void) {
    let w = this.get(id);
    if (w) {
      w.show();
      this.emit('windowShown', w.visualCal.id, w);
      return w;
    }
    const config = getWindowConfig(id, parent);
    w = this.createBrowserWindow(config);
    w.on('show', () => {
      if (!w) return;
      this.emit('windowShown', w.visualCal.id, w);
      if (onShow) onShow(w);
    });
    w.once('closed', () => {
      if (onClosed) onClosed();
    });
    w.webContents.once('did-start-loading', () => {
      if (!w) return;
      WindowUtils.centerWindowOnNearestCurorScreen(w, maximize);
    });
    w.webContents.once('did-finish-load', async () => {
      if (!w) return;
      const activeProcedureName = await global.visualCal.procedureManager.getActive();
      let activeProcedure: Procedure | undefined = undefined;
      if (activeProcedureName) activeProcedure = await global.visualCal.procedureManager.getOne(activeProcedureName);
      let sections: SectionInfo[] | undefined = undefined;
      if (nodeRed.isRunning) {
        sections = nodeRed.visualCalSectionConfigurationNodes.map(n => { return { name: n.runtime.name, shortName: n.runtime.shortName, actions: [] }; });
        sections.forEach(s => {
          s.actions = nodeRed.getVisualCalActionStartNodesForSection(s.shortName).map(a => { return { name: a.runtime.name }; });
        });
      }
      const initialLoadData: VisualCalWindowInitialLoadData = {
        windowId: w.visualCal.id,
        user: global.visualCal.userManager.activeUser ? global.visualCal.userManager.activeUser : undefined,
        session: global.visualCal.userManager.activeSession ? global.visualCal.userManager.activeSession : undefined,
        procedure: activeProcedure,
        sections: (sections && sections.length > 0) ? sections : undefined
      };
      w.webContents.send(IpcChannels.windows.initialLoadData, initialLoadData);
      if (onWebContentsDidFinishLoading) onWebContentsDidFinishLoading(w);
    });
    if (config.htmlPathType === 'url') await w.loadURL(config.htmlPath)
    else await w.loadFile(config.htmlPath);
    return w;
  }

  async showVueWindow(
      id: VisualCalWindow, 
      opts: { subPath?: string; maximize?: boolean; windowOpts?: BrowserWindowConstructorOptions; } = { maximize: true, windowOpts: defaultWindowConstructorOptions },
      onDidFinishLoading?: (bw: BrowserWindow) => void,
      onShow?: (bw: BrowserWindow) => void
    ) {
    return new Promise<BrowserWindow>(async (resolve, reject) => {
      if (global.visualCal.windowManager.isWindowLoaded(id)) return reject('Already opened');
      if (opts && !opts.windowOpts) {
        opts.windowOpts = defaultWindowConstructorOptions;
      } else if (opts && opts.windowOpts) {
        opts.windowOpts = coerceWindowConstructorOptions(id, opts.windowOpts);
      } else {
        opts = { windowOpts: defaultWindowConstructorOptions }
      }
      try {
        opts.windowOpts = setWindowSize(id, opts.windowOpts);
        const vueWindow = new BrowserWindow(opts.windowOpts);
        this.emit('windowCreated', id, vueWindow);
        global.visualCal.windowManager.add(vueWindow, id);
        vueWindow.on('show', () => {
          this.emit('windowShown', id, vueWindow);
          if (onShow) onShow(vueWindow);
        });
        vueWindow.webContents.once('did-finish-load' , async () => {
          if (onDidFinishLoading) onDidFinishLoading(vueWindow);
          WindowUtils.centerWindowOnNearestCurorScreen(vueWindow, opts.maximize);
          vueWindow.setTitle(getWindowTitle(id));
          if (opts.maximize) {
            vueWindow.maximize();
          }
          vueWindow.show();
          vueWindow.focus();
          return resolve(vueWindow);
        });
        let url = isDev() ? 'http://127.0.0.1:8080/vue' : 'http://127.0.0.1:18880/vue';
        if (opts && opts.subPath) {
          url = `${url}${opts.subPath}`;
        } else if (!opts || !opts.subPath) {
          url = `${url}${getSubPath(id)}`;
        }
        await vueWindow.loadURL(url);
      } catch (error) {
        return reject(error);
      }
    });
  }

  // Loading window
  async ShowLoading() {
    const w = await this.createWindow(VisualCalWindow.Loading);
    return w;
  }

  // Login window
  async ShowLogin() {
    global.visualCal.userManager.once('loggedIn', async () => {
      await this.showSelectProcedureWindow();
      this.closeAllBut(VisualCalWindow.SelectProcedure);
    });
    const w = await this.showVueWindow(VisualCalWindow.Login, {
      maximize: false,
      subPath: getSubPath(VisualCalWindow.Login)
    });
    return w;
  }

  // Main window
  async ShowMain() {
    const onClosed = () => this.closeAll();
    const w = await this.createWindow(VisualCalWindow.Main, undefined, true, undefined, onClosed);
    w.maximize();
    return w;
  }

  // Console log window
  async ShowConsole() {
    // const onShow = () => {
    //   try {
    //     log.query({ fields: ['message'] }, (err, results) => {
    //       if (this.consoleWindow && !err && results && Array.isArray(results)) this.consoleWindow.webContents.send('results', [results]);
    //       else if (err) throw err;
    //     });
    //   } catch (error) {
    //     dialog.showErrorBox('Error querying log', error.message);
    //   }
    // };
    const w = await this.createWindow(VisualCalWindow.Console, undefined, false);
    return w;
  }

  // Node-red editor window
  async ShowNodeRedEditor() {
    const w = await this.createWindow(VisualCalWindow.NodeRedEditor, undefined, true);
    w.maximize();
    return w;
  }

  // User input window 
  async ShowUserInputWindow(request: UserInputRequest) {
    if (!this.mainWindow) throw new Error('Main window must be defined');
    const onWebContentsDidFinishLoading = (bw: BrowserWindow) => bw.webContents.send(IpcChannels.user.input.request, request);
    const w = await this.createWindow(VisualCalWindow.UserInput, this.mainWindow, false, undefined, undefined, onWebContentsDidFinishLoading);
    return w;
  }

  // Create communication interface window
  async showCreateCommIfaceWindow(sessionName: string) {
    if (!this.mainWindow) throw new Error('Main window must be defined');
    const serialPortNames = (await SerialPort.list()).map(sp => sp.path);
    const data: CreateCommunicationInterfaceInitialData = {
      sessionName: sessionName,
      communicationInterfaceTypes: CommunicationInterfaceTypes,
      serialPortNames: serialPortNames
    };
    const onDidFinishLoading = (bw: BrowserWindow) => bw.webContents.send(IpcChannels.session.createCommunicationInterfaceInitialData, data);
    const w = await this.createWindow(VisualCalWindow.CreateCommInterface, this.mainWindow, false, undefined, undefined, onDidFinishLoading);
    return w;
  }

  // Create interactive device control window
  async showInteractiveDeviceControlWindow() {
    if (!this.mainWindow) throw new Error('Main window must be defined');
    const w = await this.createWindow(VisualCalWindow.InteractiveDeviceControl, this.mainWindow);
    return w;
  }

  // Select procedure window
  async showSelectProcedureWindow() {
    global.visualCal.procedureManager.once('activeSet', async () => {
      await nodeRed.start(ExpressServer.instance, VisualCalNodeRedSettings, global.visualCal.dirs.html.js);
      await this.showSelectSessionWindow();
      this.closeAllBut(VisualCalWindow.SelectSession);
    });
    // const w = await this.createWindow(VisualCalWindow.SelectProcedure, undefined, false, undefined, undefined, onDidFinishLoading);
    const w = await this.showVueWindow(VisualCalWindow.SelectProcedure, {
      maximize: false,
      subPath: getSubPath(VisualCalWindow.SelectProcedure)
    });
    return w;
  }

  // Create procedure window 
  async ShowCreateProcedureWindow() {
    const w = await this.createWindow(VisualCalWindow.CreateProcedure, this.selectProcedureWindow);
    return w;
  }

  async showSelectSessionWindow() {
    const activeProcedureName = await global.visualCal.procedureManager.getActive();
    if (!activeProcedureName) throw new Error('Active procedure is not set');
    // const w = await this.createWindow(VisualCalWindow.SelectSession, undefined, false);
    global.visualCal.userManager.once('activeSessionChanged', async () => {
      await this.ShowMain();
      this.closeAllBut(VisualCalWindow.Main);
    });
    const w = await this.showVueWindow(VisualCalWindow.SelectSession, {
      maximize: false,
      subPath: getSubPath(VisualCalWindow.SelectSession)
    });
    return w;
  }

  // Create session window 
  async ShowCreateSessionWindow() {
    const w = await this.createWindow(VisualCalWindow.CreateSession);
    w.show();
    return w;
  }

  async showUpdateAppWindow() {
    const w = await this.createWindow(VisualCalWindow.UpdateApp);
    return w;
  }

  async showBenchConfigViewWindow() {
    if (!this.mainWindow) throw new Error('Main window must be defined');
    const w = await this.createWindow(VisualCalWindow.BenchConfigView, this.mainWindow);
    return w;
  }

  async showDeviceBeforeWriteWindow() {
    if (!this.mainWindow) throw new Error('Main window must be defined');
    const w = await this.createWindow(VisualCalWindow.DeviceBeforeWrite, this.mainWindow);
    return w;
  }

}