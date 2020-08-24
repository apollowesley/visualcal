import { autoUpdater, UpdateInfo } from 'electron-updater';
import { ProgressInfo } from 'electron-builder';
import log from 'electron-log';
import { isDev } from '../utils/is-dev-mode';
import { TypedEmitter } from 'tiny-typed-emitter';
import { IpcChannels } from '../../constants';
import { noop } from 'lodash';

interface Events {
  error: (error: Error) => void;
  updateError: (error: Error) => void;
  checkingForUpdatesStarted: () => void;
  updateAvailable: (info: UpdateInfo) => void;
  updateNotAvailable: (info: UpdateInfo) => void;
  downloadProgressChanged: (progress: ProgressInfo) => void;
  updateDownloaded: (info: UpdateInfo) => void;
}

export class AutoUpdater extends TypedEmitter<Events> {

  fAborted = false;

  constructor() {
    super();
  }

  private get windowManager() { return global.visualCal.windowManager; }
  private get updateWindow() { return this.windowManager.updateAppWindow; }

  private onError(error: Error) {
    this.emit('error', error);
  }

  private onUpdateWindowNotShowingError() {
    this.onError(new Error('Update window is not showing'));
  }

  private sendToUpdateWindow(channel: string, arg?: Error | UpdateInfo | ProgressInfo) {
    if (this.fAborted) return;
    if (!this.updateWindow) {
      this.onUpdateWindowNotShowingError();
      return false;
    };
    this.updateWindow.webContents.send(channel, arg);
    return true;
  }

  private onUpdateError(error: Error) {
    if (this.fAborted) return;
    this.emit('updateError', error);
    this.sendToUpdateWindow(IpcChannels.autoUpdate.error, error);
    this.onError(error); // Send last so other notifications have a chance to get sent before main process reacts
  }

  private onCheckingForUpdateStarted() {
    if (this.fAborted) return;
    this.emit('checkingForUpdatesStarted');
    this.sendToUpdateWindow(IpcChannels.autoUpdate.startedChecking);
  }

  private async onUpdateAvailable(info: UpdateInfo) {
    if (this.fAborted) return;
    this.emit('updateAvailable', info);
    await this.windowManager.showUpdateAppWindow();
    if (this.updateWindow) this.updateWindow.on('show', () => this.sendToUpdateWindow(IpcChannels.autoUpdate.updateAvailable, info));
  }

  private onUpdateNotAvailable(info: UpdateInfo) {
    if (this.fAborted) return;
    this.emit('updateNotAvailable', info);
    this.sendToUpdateWindow(IpcChannels.autoUpdate.updateNotAvailable, info);
  }

  private onDownloadProgressChanged(progress: ProgressInfo) {
    if (this.fAborted) return;
    this.emit('downloadProgressChanged', progress);
    this.sendToUpdateWindow(IpcChannels.autoUpdate.downloadProgressChanged, progress);
  }

  private onUpdateDownloaded(info: UpdateInfo) {
    if (this.fAborted) return;
    this.emit('updateDownloaded', info);
    this.sendToUpdateWindow(IpcChannels.autoUpdate.updateDownloaded, info);
  }

  public async checkForUpdates() {
    this.fAborted = false;
    log.transports.console.level = 'debug';
    log.transports.file.level = 'debug';
    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.allowDowngrade = false;
    autoUpdater.allowPrerelease = true;
    autoUpdater.on('error', (error: Error) => this.onUpdateError(error));
    autoUpdater.on('checking-for-update', () => this.onCheckingForUpdateStarted());
    autoUpdater.on('update-available', (info: UpdateInfo) => this.onUpdateAvailable(info));
    autoUpdater.on('update-not-available', (info: UpdateInfo) => this.onUpdateNotAvailable(info));
    autoUpdater.on('download-progress', (progress: ProgressInfo) => this.onDownloadProgressChanged(progress));
    autoUpdater.on('update-downloaded', (info: UpdateInfo) => this.onUpdateDownloaded(info));
    if (isDev()) {
      noop(); // Do nothing, for now
    } else {
      await autoUpdater.checkForUpdatesAndNotify();
    }
  }

  public abort() {
    this.fAborted = true;
    autoUpdater.removeAllListeners();
    this.windowManager.close(VisualCalWindow.UpdateApp);
  }

}
