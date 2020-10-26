import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import electronLog from 'electron-log';
import { TypedEmitter } from 'tiny-typed-emitter';
import { IpcChannels } from '../../../constants';
import { saveComparison } from '../../ipc';
import { destroy as destroyNodeRed } from '../../node-red';
import { ExpressServer } from '../../servers/express';
import { isDev } from '../../utils';
import { setNoUpdateNotifier } from '../../utils/npm-update-notifier';
import { WindowManager } from '../WindowManager';
import fs from 'fs';
import path from 'path';

interface QuitEventOptions {
  cancel?: boolean;
  reason?: string;
}

interface Events {
  readyToLoad: () => void;
  quitting: (opts: QuitEventOptions) => void;
}

const log = electronLog.scope('ApplicationManager');

export class ApplicationManager extends TypedEmitter<Events> {

  private static fInstance: ApplicationManager;
  static get instance() {
    if (!ApplicationManager.fInstance) ApplicationManager.fInstance = new ApplicationManager();
    return this.fInstance;
  }

  private fInitialized = false;

  private constructor() {
    super();
    log.info('Loaded');
  }

  get version() {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../../package.json')).toString());
    return packageJson.version as string;
  }

  private initIpcListeners() {
    ipcMain.on(IpcChannels.application.quit.request, (event, opts: { reason: string, verify?: boolean; }) => {
      const cancelled = this.quit(opts.reason, opts.verify);
      if (!cancelled) event.reply(IpcChannels.application.quit.response, cancelled);
    });
  }

  private async onActivated() {
    if (BrowserWindow.getAllWindows().length === 0) await WindowManager.instance.ShowMain();
  }

  private onAllWindowsClosed() {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  private async onBeforeQuit() {
    setNoUpdateNotifier(true);
    log.info('Destroying logic server');
    await destroyNodeRed();
    log.info('Logic server destroyed');
    log.info('Destroying web server');
    await ExpressServer.instance.stop();
    log.info('Web server destroyed');
    global.visualCal.userManager.logout();
    if (isDev()) await saveComparison();
  }

  quit(reason?: string, verify?: boolean) {
    if (verify === undefined) verify = true;
    const opts: QuitEventOptions = {
      reason: reason,
      cancel: false
    };
    this.emit('quitting', opts); // Notify the main process managers that we are quitting and give them a chance to cancel
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow && verify) {
      // Ask the user in a dialog over the focuses window if they really want to quit
      const dialogResult = dialog.showMessageBoxSync(focusedWindow, { message: 'Are you sure you want to quit?', title: 'Quitting', buttons: ['Yes', 'No'], cancelId: 1, defaultId: 0, type: 'question' });
      opts.cancel = dialogResult === 1;
    }
    if (opts.cancel) return false;
    app.quit();
    return true;
  }

  showErrorAndQuit(title: string, message: string) {
    dialog.showErrorBox(title, message);
    this.quit(message, false);
  }

  init() {
    if (this.fInitialized) throw new Error('Already initialized');
    log.info('Initializing');
    this.initIpcListeners();
    app.on('activate', async () => await this.onActivated());
    app.on('window-all-closed', () => this.onAllWindowsClosed());
    app.on('before-quit', async () => await this.onBeforeQuit());
    this.emit('readyToLoad');
    log.info('Finished initializing');
    this.fInitialized = true;
  }

}
