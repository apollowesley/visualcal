import { BrowserWindow, dialog, app, ipcMain, WebContents } from 'electron';
import path from 'path';
import * as WindowUtils from '../utils/Window';
import { ConsoleWindowConfig, NodeRedEditorWindowConfig, LoginWindowConfig, MainWindowConfig, LoadingWindowConfig, CreateProcedureWindowConfig, CreateSessionWindowConfig, ViewSessionWindowConfig, UserInstructionWindowConfig, UserInputWindowConfig, CreateCommIfaceWindow } from './WindowConfigs';
import { IpcChannels, CommunicationInterfaceTypes } from '../../@types/constants';
import SerialPort from 'serialport';
import { SessionViewWindowOpenIPCInfo } from '../../@types/session-view';
import { getDeviceConfigurationNodeInfosForCurrentFlow } from '../node-red/utils';

export class WindowManager {

  private fWindows: Set<BrowserWindow>;
  private fClosingAll: boolean = false;

  constructor() {
    this.fWindows = new Set<BrowserWindow>();
    ipcMain.on('get-visualcal-window-id-req', (event) => {
      try {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (!window) return;
        event.reply('get-visualcal-window-id-res', window.visualCal.id);
      } catch (error) {
        event.reply('get-visualcal-window-id-err', error);
      }
    });
    ipcMain.on('show-view-session-window', async (_, sessionName: string) => {
      const session = await global.visualCal.sessionManager.getOne(sessionName);
      if (!session) throw new Error(`Unable to find session, ${sessionName}`);
      await this.ShowViewSessionWindow(session);
    });
    ipcMain.on('get-user-visualcal-dir-request', (event) => event.returnValue = path.join(app.getPath('documents'), 'IndySoft', 'VisualCal'));
    ipcMain.on(IpcChannels.windows.showCreateCommIface, (_, sessionName: string) => this.showCreateCommIfaceWindow(sessionName));
    ipcMain.on(IpcChannels.windows.show, async (_, windowId: VisualCalWindow) => {
      await this.show(windowId);
    });
  }

  get(id: VisualCalWindow) {
    return Array.from(this.fWindows).find(w => w.visualCal.id === id);
  }

  get loadingWindow() {
    const window = this.get(VisualCalWindow.Loading);
    if (window && !window.isDestroyed()) return window;
    return undefined;
  }

  get loginWindow() {
    const window = this.get(VisualCalWindow.Login);
    if (window && !window.isDestroyed()) return window;
    return undefined;
  }

  get mainWindow() {
    const window = this.get(VisualCalWindow.Main);
    if (window && !window.isDestroyed()) return window;
    return undefined;
  }

  get consoleWindow() {
    const window = this.get(VisualCalWindow.Console);
    if (window && !window.isDestroyed()) return window;
    return undefined;
  }

  get nodeRedEditorWindow() {
    const window = this.get(VisualCalWindow.NodeRedEditor);
    if (window && !window.isDestroyed()) return window;
    return undefined;
  }

  get createProcedureWindow() {
    const window = this.get(VisualCalWindow.CreateProcedure);
    if (window && !window.isDestroyed()) return window;
    return undefined;
  }

  get createSessionWindow() {
    const window = this.get(VisualCalWindow.CreateSession);
    if (window && !window.isDestroyed()) return window;
    return undefined;
  }

  get viewSessionWindow() {
    const window = this.get(VisualCalWindow.ViewSession);
    if (window && !window.isDestroyed()) return window;
    return undefined;
  }

  get userInstructionWindow() {
    const window = this.get(VisualCalWindow.UserInstruction);
    if (window && !window.isDestroyed()) return window;
    return undefined;
  }

  get userInputWindow() {
    const window = this.get(VisualCalWindow.UserInput);
    if (window && !window.isDestroyed()) return window;
    return undefined;
  }

  get createCommIfaceWindow() {
    const window = this.get(VisualCalWindow.CreateCommIface);
    if (window && !window.isDestroyed()) return window;
    return undefined;
  }

  private checkWindowExists(options: { id: VisualCalWindow }) {
    const window = Array.from(this.fWindows).find(w => w.visualCal.id === options.id) !== undefined;
    if (window) throw new Error(`Duplicate window Id, ${options.id}`);
  }

  add(window: BrowserWindow) {
    global.visualCal.logger.info('Adding window', { windowId: window.id });
    if (!window.visualCal) throw new Error(`Window with id (non-VisualCal id) ${window.id} is missing the visualCal property!`);
    this.checkWindowExists({ id: window.visualCal.id });
    this.fWindows.add(window);
    window.once('closed', () => {
      global.visualCal.logger.info('Window closed', { windowId: window.visualCal.id });
      this.remove(window.visualCal.id);
    });
  }

  remove(id: VisualCalWindow) {
    global.visualCal.logger.info('Removing window', { windowId: id });
    const existing = this.get(id);
    if (!this.fClosingAll && !existing) throw new Error(`Window not found, ${id}`);
    if (existing) this.fWindows.delete(existing);
    return existing;
  }

  create(options: CreateWindowOptions) {
    global.visualCal.logger.info('Creating window', { windowId: options.id });
    this.checkWindowExists({ id: options.id });
    const newWindow = new BrowserWindow(options.config);
    newWindow.visualCal = {
      id: options.id
    };
    this.add(newWindow);
    return newWindow;
  }

  close(id: VisualCalWindow) {
    global.visualCal.logger.info('Closing window', { windowId: id });
    const window = this.get(id);
    if (!window) return false;
    try {
      window.close();
    } catch (error) {
      throw error;
    }
    return true;
  }

  changeVisiblity(id: VisualCalWindow, show: boolean = true) {
    global.visualCal.logger.info('Changing window visiblity', { windowId: id, show: show });
    const window = this.get(id);
    if (!window) throw new Error(`Window not found, ${id}`);
    if (show) window.show();
    else window.hide();
  }

  closeAll() {
    this.fClosingAll = true;
    this.fWindows.forEach(w => {
      w.close()
    });
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
    let window = this.loadingWindow;
    if (window) {
      window.show();
      return window;
    }
    window = global.visualCal.windowManager.create(LoadingWindowConfig());
    if (!window) throw new Error('Window must be defined');
    window.webContents.once('did-finish-load', () => {
      if (window) window.show();
      setTimeout(() => {
        try {
          closedCallback();
          if (window) window.close();
        } catch (error) {
          console.error(error);
        }
      }, duration);
    });
    await window.loadFile(path.join(global.visualCal.dirs.html.windows, 'loading.html'));
    return window;
  }

    // Login window
    async ShowLogin() {
      let window = this.loginWindow;
      if (window) {
        window.show();
        return window;
      }
      window = this.create(LoginWindowConfig());
      WindowUtils.centerWindowOnNearestCurorScreen(window, false);
      await window.loadFile(path.join(global.visualCal.dirs.html.windows, 'login.html'));
      return window;
    }

  // Main window
  async ShowMain() {
    let window = this.mainWindow;
    if (window) {
      window.show();
      return window;
    }
    window = global.visualCal.windowManager.create(MainWindowConfig());
    if (!window) throw new Error('Window must be defined');
    WindowUtils.centerWindowOnNearestCurorScreen(window, true);
    window.once('close', (e) => {
      global.visualCal.windowManager.closeAll();
    });
    await window.loadFile(path.join(global.visualCal.dirs.html.bootstrapStudio, 'index.html'));
    return window;
  }
  
  // Console log window
  async ShowConsole() {
    let window = this.consoleWindow;
    if (window) {
      window.show();
      return window;
    }
    window = global.visualCal.windowManager.create(ConsoleWindowConfig());
    if (!window) throw new Error('Window must be defined');
    WindowUtils.centerWindowOnNearestCurorScreen(window, false);
    window.webContents.on('did-finish-load', () => {
      try {
        global.visualCal.logger.query({ fields: ['message'] }, (err, results) => {
          if (this.consoleWindow && !err && results && Array.isArray(results)) this.consoleWindow.webContents.send('results', [results]);
          else if (err) throw err;
        });
      } catch (error) {
        dialog.showErrorBox('Error querying log', error.message);
      }
    });
    await window.loadFile(path.join(global.visualCal.dirs.html.windows, 'console.html'));
    return window;
  }

  // Node-red editor window
  async ShowNodeRedEditor() {
    let window = this.nodeRedEditorWindow;
    if (window) {
      window.show();
      return window;
    }
    window = this.create(NodeRedEditorWindowConfig());
    WindowUtils.centerWindowOnNearestCurorScreen(window);
    await window.loadURL(`http://localhost:${global.visualCal.config.httpServer.port}/red`);
    return window;
  }

  // Create procedure window 
  async ShowCreateProcedureWindow() {
    let window = this.createProcedureWindow;
    if (window) {
      window.show();
      return window;
    }
    if (!this.mainWindow) throw new Error('Main window must be defined');
    window = this.create(CreateProcedureWindowConfig(this.mainWindow));
    await window.loadFile(global.visualCal.dirs.html.procedure.create);
    return window;
  }

  // Create session window 
  async ShowCreateSessionWindow() {
    let window = this.createSessionWindow;
    if (window) {
      window.show();
      return window;
    }
    if (!this.mainWindow) throw new Error('Main window must be defined');
    window = this.create(CreateSessionWindowConfig(this.mainWindow));
    await window.loadFile(global.visualCal.dirs.html.session.create);
    return window;
  }

  // View session window
  async ShowViewSessionWindow(session: Session) {
    let window = this.viewSessionWindow;
    if (window) {
      window.show();
      return window;
    }
    if (!global.visualCal.dirs.html.session.view) throw new Error('Missing window html file');
    if (!this.mainWindow) throw new Error('Main window must be defined');
    window = this.create(ViewSessionWindowConfig(this.mainWindow));
    const sections: SectionInfo[] = global.visualCal.nodeRed.app.settings.getSectionNodes().map(n => { return { name: n.name, shortName: n.shortName, actions: [] } });
    sections.forEach(s => {
      s.actions = global.visualCal.nodeRed.app.settings.getActionNodesForSection(s.shortName).map(a => { return { name: a.name } });
    });
    WindowUtils.centerWindowOnNearestCurorScreen(window);
    await window.loadFile(global.visualCal.dirs.html.session.view);
    const deviceConfigurationNodeInfosForCurrentFlow = getDeviceConfigurationNodeInfosForCurrentFlow();
    const viewInfo: SessionViewWindowOpenIPCInfo = {
      session: session,
      sections: sections,
      deviceConfigurationNodeInfosForCurrentFlow: deviceConfigurationNodeInfosForCurrentFlow
    };
    window.webContents.send(IpcChannels.sessions.viewInfo, viewInfo);
    return window;
  }

  // User instruction window 
  async ShowUserInstructionWindow(request: InstructionRequest) {
    let window = this.userInstructionWindow;
    if (window) {
      window.show();
      return window;
    }
    if (!this.viewSessionWindow) throw new Error('View session window must be defined');
    window = this.create(UserInstructionWindowConfig(this.viewSessionWindow));
    await window.loadFile(global.visualCal.dirs.html.userInstruction);
    window.webContents.send('user-instruction-request', request);
    return window;
  }

  // User input window 
  async ShowUserInputWindow(request: UserInputRequest) {
    let window = this.userInputWindow;
    if (window) {
      window.show();
      return window;
    }
    if (!this.viewSessionWindow) throw new Error('View session window must be defined');
    window = this.create(UserInputWindowConfig(this.viewSessionWindow));
    await window.loadFile(global.visualCal.dirs.html.userInput);
    window.webContents.send('user-input-request', request);
    return window;
  }

  // Create communication interface window
  async showCreateCommIfaceWindow(sessionName: string) {
    let window = this.userInputWindow;
    if (window) {
      window.show();
      return window;
    }
    if (!this.mainWindow) throw new Error('Main window must be defined');
    window = this.create(CreateCommIfaceWindow(this.mainWindow));
    await window.loadFile(global.visualCal.dirs.html.createCommIface);
    const serialPortNames = (await SerialPort.list()).map(sp => sp.path);
    const data: CreateCommunicationInterfaceInitialData = {
      sessionName: sessionName,
      communicationInterfaceTypes: CommunicationInterfaceTypes,
      serialPortNames: serialPortNames
    }
    window.webContents.send(IpcChannels.sessions.createCommunicationInterfaceInitialData, data);
    return window;
  }

}
