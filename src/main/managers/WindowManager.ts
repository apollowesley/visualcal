import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import createLoginWindow from './LoginWindow';

export interface BaseOptions {
  id: string;
  autoRemove?: boolean;
  isMain?: boolean;
  isConsole?: boolean;
}

export interface Window extends BaseOptions {
  window: BrowserWindow;
}

export interface CreateWindowOptions extends BaseOptions {
  config: BrowserWindowConstructorOptions;
}

export class WindowManager {

  private fWindows: Window[];
  private fMainWindow: Window | undefined;
  private fConsoleWindow: Window | undefined;

  constructor() {
    this.fWindows = [];
  }

  get(id: string) {
    return this.fWindows.find(w => w.id.toLocaleUpperCase() === id.toLocaleUpperCase());
  }

  get mainWindow() {
    return this.fMainWindow && !this.fMainWindow.window.isDestroyed() ? this.fMainWindow : undefined;
  }

  get consoleWindow() {
    return this.fConsoleWindow && !this.fConsoleWindow.window.isDestroyed() ? this.fConsoleWindow : undefined;
  }

  private checkWindowExists(options: { id: string, isMain?: boolean, isConsole?: boolean }) {
    if (options.isMain && this.mainWindow !== undefined) throw new Error('Main window already exists');
    if (options.isConsole && this.consoleWindow !== undefined) throw new Error('Console window already exists');
    const existing = this.get(options.id);
    if (existing) throw new Error(`Duplicate window Id, ${options.id}`);
  }

  add(window: Window) {
    global.visualCal.logger.info('Adding window', { windowId: window.id });
    this.checkWindowExists({ id: window.id, isMain: window.isMain, isConsole: window.isConsole });
    if (window.isMain) this.fMainWindow = window;
    if (window.isConsole) this.fConsoleWindow = window;
    this.fWindows.push(window);
    if (window.autoRemove) window.window.on('closed', () => {
      global.visualCal.logger.info('Window closed', { windowId: window.id });
      this.remove(window.id);
    });
  }

  remove(id: string) {
    global.visualCal.logger.info('Removing window', { windowId: id });
    const existing = this.get(id);
    if (!existing) throw new Error(`Window not found, ${id}`);
    const windowIndex = this.fWindows.indexOf(existing);
    if (existing.isMain) this.fMainWindow = undefined;
    if (existing.isConsole) this.fConsoleWindow = undefined;
    this.fWindows.splice(windowIndex, 1);
    return existing;
  }

  create(options: CreateWindowOptions) {
    global.visualCal.logger.info('Creating window', { windowId: options.id });
    this.checkWindowExists({ id: options.id, isMain: options.isMain, isConsole: options.isConsole });
    const newWindow = new BrowserWindow(options.config);
    this.add({
      id: options.id,
      window: newWindow,
      autoRemove: options.autoRemove,
      isMain: options.isMain,
      isConsole: options.isConsole
    });
    return newWindow;
  }

  close(id: string) {
    global.visualCal.logger.info('Closing window', { windowId: id });
    const window = this.get(id);
    if (!window) return false;
    try {
      window.window.close();
    } catch (error) {
      throw error;
    }
    return true;
  }

  changeVisiblity(id: string, show: boolean = true) {
    global.visualCal.logger.info('Changing window visiblity', { windowId: id, show: show });
    const window = this.get(id);
    if (!window) throw new Error(`Window not found, ${id}`);
    if (show) window.window.show();
    else window.window.hide();
  }

  // TODO: Only close windows that aren't main.  Figure out if this is correct way.
  closeAll() {
    this.fWindows.forEach(w => {
      if (!w.isMain) w.window.close()
    });
    this.fWindows = [];
  }

  static async ShowLogin() {
    const mainWindow = global.visualCal.windowManager.mainWindow ? global.visualCal.windowManager.mainWindow.window : undefined;
    const loginWindow = await createLoginWindow({ parent: mainWindow });
    global.visualCal.windowManager.add({
      id: 'login',
      window: loginWindow,
      autoRemove: true
    });
  }

}
