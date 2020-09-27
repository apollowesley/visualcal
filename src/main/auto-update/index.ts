import { autoUpdater, CancellationToken, UpdateInfo } from '@imjs/electron-differential-updater';
import { ProgressInfo } from 'electron-builder';
import { isDev } from '../utils';
import { TypedEmitter } from 'tiny-typed-emitter';
import { BrowserWindow, dialog, ipcMain } from 'electron';
import electronLog from 'electron-log';
import { AutoUpdateEvents, IpcChannels } from 'visualcal-common/dist/auto-update';

const log = electronLog.create('auto-update');
log.transports.file.level = false;
log.transports.console.level = 'warn';

interface Events extends AutoUpdateEvents {
  aborted: () => void;
  cancelled: () => void;
}

export class AutoUpdater extends TypedEmitter<Events> {

  fUpdateWindow: BrowserWindow;
  fAborted = false;
  fCancellationToken?: CancellationToken;

  constructor(updateWindow: BrowserWindow) {
    super();
    this.fUpdateWindow = updateWindow;
  }

  private get updateWindow() { return this.fUpdateWindow; }

  private onAborted() {
    this.emit('aborted');
  }

  private onError(error: Error) {
    log.error(error);
    this.emit('error', error);
  }

  private sendToUpdateWindow(channel: string, arg?: Error | UpdateInfo | ProgressInfo) {
    if (this.fAborted) {
      this.onAborted();
      return;
    }
    setImmediate( () => this.updateWindow.webContents.send(channel, arg));
  }

  private onUpdateError(error: Error) {
    log.info('onUpdateError');
    if (this.fAborted) {
      this.onAborted();
      return;
    }
    this.emit('updateError', error);
    this.sendToUpdateWindow(IpcChannels.Error, error);
    this.onError(error); // Send last so other notifications have a chance to get sent before main process reacts
  }

  private onCheckingForUpdateStarted() {
    log.info('onCheckingForUpdateStarted');
    if (this.fAborted) {
      this.onAborted();
      return;
    }
    this.emit('checkingForUpdatesStarted');
    this.sendToUpdateWindow(IpcChannels.StartedChecking);
  }

  private async onUpdateAvailable(info: UpdateInfo) {
    log.info('onUpdateAvailable');
    if (this.fAborted) {
      this.onAborted();
      return;
    }
    ipcMain.once(IpcChannels.DownloadAndInstallRequest, async () => {
      this.fCancellationToken = new CancellationToken();
      try {
        await autoUpdater.downloadUpdate(this.fCancellationToken);
      } catch (error) {
        const err = error as Error;
        dialog.showErrorBox('An error occured attempting to download the update', err.message);
        this.emit('error', err);
      }
    });
    ipcMain.once(IpcChannels.CancelRequest, () => {
      this.emit('cancelled');
    });
    this.emit('updateAvailable', info);
    this.sendToUpdateWindow(IpcChannels.UpdateAvailable, info);
  }

  private onUpdateNotAvailable(info: UpdateInfo) {
    log.info('onUpdateNotAvailable');
    if (this.fAborted) {
      this.onAborted();
      return;
    }
    this.emit('updateNotAvailable', info);
    this.sendToUpdateWindow(IpcChannels.UpdateNotAvailable, info);
  }

  private onDownloadProgressChanged(progress: ProgressInfo) {
    if (this.fAborted) {
      this.onAborted();
      return;
    }
    // this.emit('downloadProgressChanged', progress);
    this.sendToUpdateWindow(IpcChannels.DownloadProgressChanged, progress);
  }

  private onUpdateDownloaded(info: UpdateInfo) {
    log.info('onUpdateDownloaded');
    if (this.fAborted) {
      this.onAborted();
      return;
    }
    this.emit('updateDownloaded', info);
    this.sendToUpdateWindow(IpcChannels.UpdateDownloaded, info);
    autoUpdater.quitAndInstall();
  }

  public async checkForUpdates() {
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
  }

}
