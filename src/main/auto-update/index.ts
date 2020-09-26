import { autoUpdater, CancellationToken, UpdateInfo } from '@imjs/electron-differential-updater';
import { ProgressInfo } from 'electron-builder';
import { isDev } from '../utils/is-dev-mode';
import { TypedEmitter } from 'tiny-typed-emitter';
import { VisualCalWindow } from '../../constants';
import { dialog, ipcMain } from 'electron';
import electronLog from 'electron-log';
import { AutoUpdateEvents, IpcChannels } from 'visualcal-common/types/auto-update';

const autoUpdateLogger = electronLog.create('auto-update');
autoUpdateLogger.transports.file.level = false;
autoUpdateLogger.transports.console.level = 'info';
const log = autoUpdateLogger.scope('auto-update');

export class AutoUpdater extends TypedEmitter<AutoUpdateEvents> {

  fAborted = false;
  fCancellationToken?: CancellationToken;

  constructor() {
    super();
  }

  private get windowManager() { return global.visualCal.windowManager; }
  private get updateWindow() { return this.windowManager.updateAppWindow; }

  private onError(error: Error) {
    log.error(error);
    this.emit('error', error);
  }

  private onUpdateWindowNotShowingError() {
    log.error('Update window is not showing');
    this.onError(new Error('Update window is not showing'));
  }

  private sendToUpdateWindow(channel: string, arg?: Error | UpdateInfo | ProgressInfo) {
    if (this.fAborted) return;
    if (!this.updateWindow) {
      this.onUpdateWindowNotShowingError();
      return false;
    };
    setImmediate( () => {
      if (!this.updateWindow) return;
      this.updateWindow.webContents.send(channel, arg);
    });
    return true;
  }

  private onUpdateError(error: Error) {
    log.info('onUpdateError');
    if (this.fAborted) return;
    this.emit('updateError', error);
    if (this.updateWindow) this.sendToUpdateWindow(IpcChannels.Error, error);
    this.onError(error); // Send last so other notifications have a chance to get sent before main process reacts
  }

  private onCheckingForUpdateStarted() {
    log.info('onCheckingForUpdateStarted');
    if (this.fAborted) return;
    this.emit('checkingForUpdatesStarted');
    if (this.updateWindow) this.sendToUpdateWindow(IpcChannels.StartedChecking);
  }

  private async onUpdateAvailable(info: UpdateInfo) {
    log.info('onUpdateAvailable');
    if (this.fAborted) return;
    ipcMain.once(IpcChannels.DownloadAndInstallRequest, async () => {
      this.fCancellationToken = new CancellationToken();
      try {
        await autoUpdater.downloadUpdate(this.fCancellationToken);
      } catch (error) {
        const err = error as Error;
        dialog.showErrorBox('An error occured attempting to download the update', err.message);
      }
    });
    ipcMain.once(IpcChannels.CancelRequest, () => {
      global.visualCal.windowManager.close(VisualCalWindow.UpdateApp);
      throw new Error('Cancelled');
    });
    this.emit('updateAvailable', info);
    if (this.updateWindow) this.updateWindow.webContents.once('did-finish-load', () => {
      this.sendToUpdateWindow(IpcChannels.UpdateAvailable, info);
    });
  }

  private onUpdateNotAvailable(info: UpdateInfo) {
    log.info('onUpdateNotAvailable');
    if (this.fAborted) return;
    this.emit('updateNotAvailable', info);
    if (this.updateWindow) this.sendToUpdateWindow(IpcChannels.UpdateNotAvailable, info);
  }

  private onDownloadProgressChanged(progress: ProgressInfo) {
    log.info('onDownloadProgressChanged');
    if (this.fAborted) return;
    // this.emit('downloadProgressChanged', progress);
    this.sendToUpdateWindow(IpcChannels.DownloadProgressChanged, progress);
  }

  private onUpdateDownloaded(info: UpdateInfo) {
    log.info('onUpdateDownloaded');
    if (this.fAborted) return;
    this.emit('updateDownloaded', info);
    if (this.updateWindow) this.sendToUpdateWindow(IpcChannels.UpdateDownloaded, info);
    autoUpdater.quitAndInstall();
  }

  public async checkForUpdates() {
    await this.windowManager.showUpdateAppWindow();
    this.windowManager.closeAllBut(VisualCalWindow.UpdateApp);
    this.fAborted = false;
    // autoUpdater.logger = log;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.allowDowngrade = false;
    autoUpdater.allowPrerelease = true;
    autoUpdater.logger = log;
    autoUpdater.on('error', (error: Error) => this.onUpdateError(error));
    autoUpdater.on('checking-for-update', () => this.onCheckingForUpdateStarted());
    autoUpdater.on('update-available', async (info: UpdateInfo) => {
      try {
        await this.onUpdateAvailable(info);
      } catch (error) {
        if (error.message && error.message === 'Cancelled') return;
      }
    });
    autoUpdater.on('update-not-available', (info: UpdateInfo) => this.onUpdateNotAvailable(info));
    autoUpdater.on('download-progress', (progress: ProgressInfo) => this.onDownloadProgressChanged(progress));
    autoUpdater.on('update-downloaded', (info: UpdateInfo) => this.onUpdateDownloaded(info));
    if (isDev()) {
      await Promise.resolve();
    } else {
      log.info('Checking for updates');
      await autoUpdater.checkForUpdatesAndNotify();
    }
  }

  public abort() {
    this.fAborted = true;
    if (this.fCancellationToken && !this.fCancellationToken.cancelled) this.fCancellationToken.cancel();
    autoUpdater.removeAllListeners();
    if (this.windowManager.updateAppWindow) this.windowManager.close(VisualCalWindow.UpdateApp);
  }

}
