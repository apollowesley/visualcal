import { autoUpdater, UpdateInfo } from 'electron-updater';
import { ProgressInfo } from 'electron-builder'
import log from 'electron-log';

const onError = (error: Error) => {
  console.error('Auto-update error', error);
}

const onCheckingForUpdate = () => {
  console.info('Auto-update checking for updates');
}

const onUpdateAvailable = (info: UpdateInfo) => {
  console.info('Update available', info);
}

const onUpdateNotAvailable = (info: UpdateInfo) => {
  console.info('No update available', info);
}

const onDownloadProgress = (progress: ProgressInfo) => {
  console.info(`Auto-update download progress ${progress.percent}%`);
}

const onUpdateDownloaded = (info: UpdateInfo) => {
  console.info('Update downloaded', info);
}

export default async () => {
    log.transports.console.level = 'debug';
    log.transports.file.level = 'debug';
    autoUpdater.logger = log;
    autoUpdater.setFeedURL('https://github.com/scottpageindysoft/visualcal/releases/latest');
    autoUpdater.on('error', onError);
    autoUpdater.on('checking-for-update', onCheckingForUpdate);
    autoUpdater.on('update-available', onUpdateAvailable);
    autoUpdater.on('update-not-available', onUpdateNotAvailable);
    autoUpdater.on('download-progress', onDownloadProgress);
    autoUpdater.on('update-downloaded', onUpdateDownloaded);
    await autoUpdater.checkForUpdatesAndNotify();
}
