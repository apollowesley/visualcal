import { app, BrowserWindow, dialog, ipcMain, OpenDialogOptions, SaveDialogOptions, WebContents } from 'electron';
import SerialPort from 'serialport';
import { TypedEmitter } from 'tiny-typed-emitter';
import { Logger } from 'winston';
import { CommunicationInterfaceTypes, IpcChannels } from '../../constants';
import * as WindowUtils from '../utils/Window';
import { getConfig as getWindowConfig } from './WindowConfigs';

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
  private fClosingAll: boolean = false;
  private fLogger: Logger;

  constructor(logger: Logger) {
    super();
    this.fLogger = logger;
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
      await this.ShowViewSessionWindow();
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

    ipcMain.on(IpcChannels.sessions.cancelSelect, async () => {
      await this.showSelectProcedureWindow();
      this.closeAllBut(VisualCalWindow.SelectProcedure);
    });

    ipcMain.on(IpcChannels.sessions.cancelCreate, () => {
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
  get viewSessionWindow() { return this.get(VisualCalWindow.ViewSession); }
  get userInputWindow() { return this.get(VisualCalWindow.UserInput); }
  get createCommIfaceWindow() { return this.get(VisualCalWindow.CreateCommInterface); }
  get interactiveDeviceControlWindow() { return this.get(VisualCalWindow.InteractiveDeviceControl); }
  get selectProcedureWindow() { return this.get(VisualCalWindow.SelectProcedure); }
  get updateAppWindow() { return this.get(VisualCalWindow.UpdateApp); }

  private checkWindowExists(id: VisualCalWindow) {
    const browserWindow = Array.from(this.fWindows).find(w => w.visualCal.id === id) !== undefined;
    if (browserWindow) throw new Error(`Duplicate window Id, ${id}`);
  }

  add(browserWindow: BrowserWindow) {
    this.fLogger.info('Adding window', { windowId: browserWindow.visualCal.id });
    if (!browserWindow.visualCal || !browserWindow.visualCal.id) throw new Error(`Attempting to add a BrowserWindow without a VisualCal.id or an unused BrowserWindow detected with ID, ${browserWindow.visualCal.id}`);
    this.checkWindowExists(browserWindow.visualCal.id);
    this.fWindows.add(browserWindow);
    browserWindow.on('closed', () => this.onWindowClosed(browserWindow.visualCal.id));
    this.emit('windowAdded', browserWindow.visualCal.id);
  }

  remove(id: VisualCalWindow) {
    this.fLogger.info('Removing window', { windowId: id });
    const existing = Array.from(this.fWindows).find(w => w.visualCal.id === id);
    if (!existing) return;
    this.fWindows.delete(existing);
    this.fLogger.info('Window removed', { windowId: id });
    this.emit('windowRemoved', id);
  }

  private onWindowClosed(id: VisualCalWindow) {
    this.fLogger.info('Window closed', { windowId: id });
    this.remove(id);
    this.emit('windowClosed', id);
  }

  close(id: VisualCalWindow) {
    this.fLogger.info('Closing window', { windowId: id });
    const browserWindow = this.get(id);
    if (!browserWindow) this.fLogger.warn(`Attempt to close window, ${id}, but it wasn\'t open`);
    if (browserWindow) browserWindow.close();
  };

  changeVisiblity(id: VisualCalWindow, show: boolean = true) {
    this.fLogger.info('Changing window visiblity', { windowId: id, show: show });
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
    this.fClosingAll = true;
    this.fWindows.forEach(browserWindow => this.close(browserWindow.visualCal.id));
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
    this.fLogger.info('Creating window', { windowId: options.id });
    this.checkWindowExists(options.id);
    const newWindow = new BrowserWindow(options.browserWindow);
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
      return w;
    }
    const config = getWindowConfig(id, parent);
    w = this.createBrowserWindow(config);
    w.webContents.once('did-start-loading', () => {
      if (!w) return;
      WindowUtils.centerWindowOnNearestCurorScreen(w, maximize);
    });
    w.webContents.once('did-finish-load', () => {
      if (!w) return;
      if (onWebContentsDidFinishLoading) onWebContentsDidFinishLoading(w);
    });
    w.once('show', () => {
      if (!w) return;
      if (onShow) onShow(w);
    });
    w.once('closed', () => {
      if (onClosed) onClosed();
    });
    if (config.htmlPathType === 'url') await w.loadURL(config.htmlPath)
    else await w.loadFile(config.htmlPath);
    return w;
  }

  // Loading window
  async ShowLoading() {
    const w = await this.createWindow(VisualCalWindow.Loading);
    return w;
  }

  // Login window
  async ShowLogin() {
    const w = await this.createWindow(VisualCalWindow.Login);
    w.show();
    return w;
  }

  // Main window
  async ShowMain() {
    const onClosed = () => this.closeAll();
    const w = await this.createWindow(VisualCalWindow.Main, undefined, true, undefined, onClosed);
    return w;
  }

  // Console log window
  async ShowConsole() {
    const onShow = () => {
      try {
        this.fLogger.query({ fields: ['message'] }, (err, results) => {
          if (this.consoleWindow && !err && results && Array.isArray(results)) this.consoleWindow.webContents.send('results', [results]);
          else if (err) throw err;
        });
      } catch (error) {
        dialog.showErrorBox('Error querying log', error.message);
      }
    };
    const w = await this.createWindow(VisualCalWindow.Console, undefined, false, onShow);
    return w;
  }

  // Node-red editor window
  async ShowNodeRedEditor() {
    const w = await this.createWindow(VisualCalWindow.NodeRedEditor, undefined, true);
    return w;
  }

  // User input window 
  async ShowUserInputWindow(request: UserInputRequest) {
    if (!this.viewSessionWindow) throw new Error('Main window must be defined');
    const onWebContentsDidFinishLoading = (bw: BrowserWindow) => bw.webContents.send(IpcChannels.user.input.request, request);
    const w = await this.createWindow(VisualCalWindow.UserInput, this.viewSessionWindow, false, undefined, undefined, onWebContentsDidFinishLoading);
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
    const onDidFinishLoading = (bw: BrowserWindow) => bw.webContents.send(IpcChannels.sessions.createCommunicationInterfaceInitialData, data);
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
    const procedures = await global.visualCal.procedureManager.getAll();
    const onDidFinishLoading = (bw: BrowserWindow) => bw.webContents.send(IpcChannels.procedures.selectData, procedures);
    global.visualCal.procedureManager.once('activeSet', async () => {
      await this.showSelectSessionWindow();
      this.closeAllBut(VisualCalWindow.SelectSession);
    });
    const w = await this.createWindow(VisualCalWindow.SelectProcedure, undefined, false, undefined, undefined, onDidFinishLoading);
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
    const sessions = await global.visualCal.sessionManager.getAll();
    const sessionsForProc = sessions.filter(s => s.procedureName === activeProcedureName);
    const onDidFinishLoading = (bw: BrowserWindow) => bw.webContents.send(IpcChannels.sessions.selectData, { procedureName: activeProcedureName, sessions: sessionsForProc });
    const w = await this.createWindow(VisualCalWindow.SelectSession, undefined, false, undefined, undefined, onDidFinishLoading);
    global.visualCal.sessionManager.once('activeSet', async () => {
      await this.ShowMain();
      this.closeAllBut(VisualCalWindow.Main);
    });
    return w;
  }

  // Create session window 
  async ShowCreateSessionWindow() {
    const w = await this.createWindow(VisualCalWindow.CreateSession);
    w.show();
    return w;
  }

  // View session window
  async ShowViewSessionWindow() {
    if (!this.mainWindow) throw new Error('Main window must be defined');
    const w = await this.createWindow(VisualCalWindow.ViewSession, this.mainWindow, true);
    return w;
  }

  async showUpdateAppWindow() {
    const w = await this.createWindow(VisualCalWindow.UpdateApp);
    return w;
  }

}
