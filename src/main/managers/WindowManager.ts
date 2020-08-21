import { BrowserWindow, dialog, ipcMain, OpenDialogOptions, SaveDialogOptions, WebContents } from 'electron';
import path from 'path';
import SerialPort from 'serialport';
import { TypedEmitter } from 'tiny-typed-emitter';
import { Logger } from 'winston';
import { SessionViewWindowOpenIPCInfo } from '../../@types/session-view';
import { CommunicationInterfaceTypes, IpcChannels } from '../../constants';
import { getDeviceConfigurationNodeInfosForCurrentFlow } from '../node-red/utils';
import * as WindowUtils from '../utils/Window';
import * as windowConfigs from './WindowConfigs';

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
    ipcMain.on(IpcChannels.windows.showViewSession, async (_, sessionName: string) => {
      const session = await global.visualCal.sessionManager.getOne(sessionName);
      if (!session) throw new Error(`Unable to find session, ${sessionName}`);
      await this.ShowViewSessionWindow(session);
    });
    ipcMain.on(IpcChannels.windows.showCreateCommIface, (_, sessionName: string) => this.showCreateCommIfaceWindow(sessionName));
    ipcMain.on(IpcChannels.windows.show, async (_, windowId: VisualCalWindow) => {
      await this.show(windowId);
    });
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
  }

  // Sends an IPC message to all BrowserWindows
  sendToAll(channel: string, ...args: any[]) {
    BrowserWindow.getAllWindows().forEach(w => {
      if (!w.isDestroyed()) w.webContents.send(channel, ...args);
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
  get createCommIfaceWindow() { return this.get(VisualCalWindow.CreateCommIface); }
  get interactiveDeviceControlWindow() { return this.get(VisualCalWindow.InteractiveDeviceControl); }
  get selectProcedureWindow() { return this.get(VisualCalWindow.SelectProcedure); }
  get updateAppWindow() { return this.get(VisualCalWindow.UpdateApp); }

  private checkWindowExists(id: VisualCalWindow) {
    const browserWindow = Array.from(this.fWindows).find(w => w.visualCal.id === id) !== undefined;
    if (browserWindow) throw new Error(`Duplicate window Id, ${id}`);
  }

  add(browserWindow: BrowserWindow) {
    this.fLogger.info('Adding window', { windowId: browserWindow.visualCal.id });
    if (!browserWindow.visualCal || browserWindow.visualCal.id < 0) throw new Error(`Attempting to add a BrowserWindow without a VisualCal.id or an unused BrowserWindow detected with ID, ${browserWindow.visualCal.id}`);
    this.checkWindowExists(browserWindow.visualCal.id);
    this.fWindows.add(browserWindow);
    browserWindow.once('closed', () => this.onWindowClosed(browserWindow.visualCal.id));
    this.emit('windowAdded', browserWindow.visualCal.id);
  }

  remove(id: VisualCalWindow) {
    this.fLogger.info('Removing window', { windowId: id });
    const existing = this.get(id);
    if (!existing) return;
    this.fWindows.delete(existing);
    this.fLogger.info('Window removed', { windowId: id });
    this.emit('windowRemoved', id);
  }

  create(options: CreateWindowOptions) {
    this.fLogger.info('Creating window', { windowId: options.id });
    this.checkWindowExists(options.id);
    const newWindow = new BrowserWindow(options.config);
    newWindow.visualCal = {
      id: options.id
    };
    this.add(newWindow);
    return newWindow;
  }

  private onWindowClosed(id: VisualCalWindow) {
    this.fLogger.info('Window closed', { windowId: id });
    this.emit('windowClosed', id);
    this.remove(id);
  }

  close(id: VisualCalWindow) {
    this.fLogger.info('Closing window', { windowId: id });
    const browserWindow = this.get(id);
    if (!this.fClosingAll && !browserWindow) throw new Error(`Window with ID, ${id} is not open`);
    if (browserWindow) browserWindow.close();
  };

  changeVisiblity(id: VisualCalWindow, show: boolean = true) {
    this.fLogger.info('Changing window visiblity', { windowId: id, show: show });
    const browserWindow = this.get(id);
    if (!browserWindow) throw new Error(`Window not found, ${id}`);
    if (show) browserWindow.show();
    else browserWindow.hide();
  }

  closeAll() {
    this.fClosingAll = true;
    this.fWindows.forEach(browserWindow => this.close(browserWindow.visualCal.id));
    this.fWindows.clear();
  }

  // *************************************************
  // ************** CREATE/SHOW WINDOWS **************
  // *************************************************

  async show(windowId: VisualCalWindow) {
    switch (windowId) {
      case VisualCalWindow.Console:
        break;
      case VisualCalWindow.CreateProcedure:
        await this.ShowCreateProcedureWindow();
        break;
      case VisualCalWindow.CreateSession:
        await this.ShowCreateSessionWindow();
        break;
      case VisualCalWindow.Loading:
        break;
      case VisualCalWindow.Login:
        break;
      case VisualCalWindow.Main:
        break;
      case VisualCalWindow.NodeRedEditor:
        break;
      case VisualCalWindow.UserInput:
        break;
      case VisualCalWindow.UserInstruction:
        break;
      case VisualCalWindow.SelectProcedure:
        break;
      case VisualCalWindow.InteractiveDeviceControl:
        break;
      case VisualCalWindow.UpdateApp:
        break;
      default:
        throw new Error(`Invalid window Id, ${windowId}`);
    }
  }

  async showErrorDialog(parentWebContents: WebContents, error: Error) {
    const parent = BrowserWindow.fromWebContents(parentWebContents);
    if (!parent) throw new Error('Unable to find BrowserWindow from WebContents');
    dialog.showErrorBox('Error', error.message);
  }

  // Loading window
  async ShowLoading(closedCallback: () => void, duration: number = 5000) {
    let browserWindow = this.loadingWindow;
    if (browserWindow) {
      browserWindow.show();
      return browserWindow;
    }
    browserWindow = global.visualCal.windowManager.create(windowConfigs.LoadingWindowConfig());
    if (!browserWindow) throw new Error('Window must be defined');
    browserWindow.webContents.once('did-finish-load', () => {
      if (browserWindow) browserWindow.show();
      setTimeout(() => {
        try {
          closedCallback();
          if (browserWindow) browserWindow.close();
        } catch (error) {
          console.error(error);
        }
      }, duration);
    });
    await browserWindow.loadFile(path.join(global.visualCal.dirs.html.windows, 'loading.html'));
    return browserWindow;
  }

  // Login window
  async ShowLogin() {
    let browserWindow = this.loginWindow;
    if (browserWindow) {
      browserWindow.show();
      return browserWindow;
    }
    browserWindow = this.create(windowConfigs.LoginWindowConfig());
    WindowUtils.centerWindowOnNearestCurorScreen(browserWindow, false);
    await browserWindow.loadFile(path.join(global.visualCal.dirs.html.bootstrapStudio, 'login.html'));
    return browserWindow;
  }

  // Main window
  async ShowMain() {
    let browserWindow = this.mainWindow;
    if (browserWindow) {
      browserWindow.show();
      return browserWindow;
    }
    browserWindow = global.visualCal.windowManager.create(windowConfigs.MainWindowConfig());
    if (!browserWindow) throw new Error('Window must be defined');
    WindowUtils.centerWindowOnNearestCurorScreen(browserWindow, true);
    browserWindow.maximize();
    browserWindow.once('close', (e) => {
      global.visualCal.windowManager.closeAll();
    });
    await browserWindow.loadFile(path.join(global.visualCal.dirs.html.bootstrapStudio, 'index.html'));
    return browserWindow;
  }

  // Console log window
  async ShowConsole() {
    let browserWindow = this.consoleWindow;
    if (browserWindow) {
      browserWindow.show();
      return browserWindow;
    }
    browserWindow = global.visualCal.windowManager.create(windowConfigs.ConsoleWindowConfig());
    if (!browserWindow) throw new Error('Window must be defined');
    WindowUtils.centerWindowOnNearestCurorScreen(browserWindow, false);
    browserWindow.webContents.on('did-finish-load', () => {
      try {
        this.fLogger.query({ fields: ['message'] }, (err, results) => {
          if (this.consoleWindow && !err && results && Array.isArray(results)) this.consoleWindow.webContents.send('results', [results]);
          else if (err) throw err;
        });
      } catch (error) {
        dialog.showErrorBox('Error querying log', error.message);
      }
    });
    await browserWindow.loadFile(path.join(global.visualCal.dirs.html.windows, 'console.html'));
    return browserWindow;
  }

  // Node-red editor window
  async ShowNodeRedEditor() {
    let browserWindow = this.nodeRedEditorWindow;
    if (browserWindow) {6
      browserWindow.show();
      return browserWindow;
    }
    browserWindow = this.create(windowConfigs.NodeRedEditorWindowConfig());
    WindowUtils.centerWindowOnNearestCurorScreen(browserWindow);
    await browserWindow.loadURL(`http://localhost:${global.visualCal.config.httpServer.port}/red`);
    return browserWindow;
  }

  // Create procedure window 
  async ShowCreateProcedureWindow() {
    let browserWindow = this.createProcedureWindow;
    if (browserWindow) {
      browserWindow.show();
      return browserWindow;
    }
    if (!this.mainWindow) throw new Error('Main window must be defined');
    browserWindow = this.create(windowConfigs.CreateProcedureWindowConfig(this.mainWindow));
    await browserWindow.loadFile(global.visualCal.dirs.html.procedure.create);
    return browserWindow;
  }

  // Create session window 
  async ShowCreateSessionWindow() {
    let browserWindow = this.createSessionWindow;
    if (browserWindow) {
      browserWindow.show();
      return browserWindow;
    }
    if (!this.mainWindow) throw new Error('Main window must be defined');
    browserWindow = this.create(windowConfigs.CreateSessionWindowConfig(this.mainWindow));
    await browserWindow.loadFile(global.visualCal.dirs.html.session.create);
    return browserWindow;
  }

  // View session window
  async ShowViewSessionWindow(session: Session) {
    let browserWindow = this.viewSessionWindow;
    if (browserWindow) {
      browserWindow.show();
      return browserWindow;
    }
    if (!global.visualCal.dirs.html.session.view) throw new Error('Missing window html file');
    if (!this.mainWindow) throw new Error('Main window must be defined');
    browserWindow = this.create(windowConfigs.ViewSessionWindowConfig(this.mainWindow));
    const sections: SectionInfo[] = global.visualCal.nodeRed.app.settings.getSectionNodes().map(n => { return { name: n.name, shortName: n.shortName, actions: [] }; });
    sections.forEach(s => {
      s.actions = global.visualCal.nodeRed.app.settings.getActionNodesForSection(s.shortName).map(a => { return { name: a.name }; });
    });
    browserWindow.maximize();
    await browserWindow.loadFile(global.visualCal.dirs.html.session.view);
    const deviceConfigurationNodeInfosForCurrentFlow = getDeviceConfigurationNodeInfosForCurrentFlow();
    const viewInfo: SessionViewWindowOpenIPCInfo = {
      session: session,
      sections: sections,
      deviceConfigurationNodeInfosForCurrentFlow: deviceConfigurationNodeInfosForCurrentFlow
    };
    browserWindow.webContents.send(IpcChannels.sessions.viewInfo, viewInfo);
    return browserWindow;
  }

  // User input window 
  async ShowUserInputWindow(request: UserInputRequest) {
    let browserWindow = this.userInputWindow;
    if (browserWindow) {
      browserWindow.show();
      return browserWindow;
    }
    if (!this.viewSessionWindow) throw new Error('View session window must be defined');
    browserWindow = this.create(windowConfigs.UserInputWindowConfig(this.viewSessionWindow));
    await browserWindow.loadFile(global.visualCal.dirs.html.userAction);
    browserWindow.webContents.send('user-input-request', request);
    return browserWindow;
  }

  // Create communication interface window
  async showCreateCommIfaceWindow(sessionName: string) {
    let browserWindow = this.userInputWindow;
    if (browserWindow) {
      browserWindow.show();
      return browserWindow;
    }
    if (!this.mainWindow) throw new Error('Main window must be defined');
    browserWindow = this.create(windowConfigs.CreateCommIfaceWindow(this.mainWindow));
    await browserWindow.loadFile(global.visualCal.dirs.html.createCommIface);
    const serialPortNames = (await SerialPort.list()).map(sp => sp.path);
    const data: CreateCommunicationInterfaceInitialData = {
      sessionName: sessionName,
      communicationInterfaceTypes: CommunicationInterfaceTypes,
      serialPortNames: serialPortNames
    };
    browserWindow.webContents.send(IpcChannels.sessions.createCommunicationInterfaceInitialData, data);
    return browserWindow;
  }

  // Create interactive device control window
  async showInteractiveDeviceControlWindow() {
    let browserWindow = this.interactiveDeviceControlWindow;
    if (browserWindow) {
      browserWindow.show();
      return browserWindow;
    }
    if (!this.mainWindow) throw new Error('Main window must be defined');
    browserWindow = this.create(windowConfigs.InteractiveDeviceControlWindow(this.mainWindow));
    await browserWindow.loadFile(path.join(global.visualCal.dirs.html.bootstrapStudio, 'interactive-device-control.html'));
    return browserWindow;
  }

  async showSelectProcedureWindow() {
    let browserWindow = this.interactiveDeviceControlWindow;
    if (browserWindow) {
      browserWindow.show();
      return browserWindow;
    }
    global.visualCal.procedureManager.once('activeSet', async () => {
      if (browserWindow) {
        await this.ShowMain();
        browserWindow.close();
      }
    });
    browserWindow = this.create(windowConfigs.SelectProcedureWindowOptions());
    WindowUtils.centerWindowOnNearestCurorScreen(browserWindow, false);
    await browserWindow.loadFile(path.join(global.visualCal.dirs.html.bootstrapStudio, 'procedure-select.html'));
    return browserWindow;
  }

  async showUpdateAppWindow() {
    let browserWindow = this.updateAppWindow;
    if (browserWindow) {
      browserWindow.show();
      return browserWindow;
    }
    browserWindow = this.create(windowConfigs.UpdateAppWindowOptions());
    WindowUtils.centerWindowOnNearestCurorScreen(browserWindow, false);
    await browserWindow.loadFile(path.join(global.visualCal.dirs.html.bootstrapStudio, 'update-app.html'));
    return browserWindow;
  }

}
