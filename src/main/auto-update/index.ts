import { autoUpdater, UpdateInfo } from 'electron-updater';
import { ProgressInfo } from 'electron-builder';
import log from 'electron-log';
import { BrowserWindow } from 'electron';
import path from 'path';

let updateWindow: BrowserWindow;

const onError = (error: Error) => {
  console.error('Auto-update error', error);
  updateWindow.webContents.emit('error', error);
};

const onCheckingForUpdate = () => {
  console.info('Auto-update checking for updates');
  updateWindow.webContents.send('checking-for-update');
};

const onUpdateAvailable = (info: UpdateInfo) => {
  console.info('Update available', info);
  updateWindow.webContents.send('update-available', info);
};

const onUpdateNotAvailable = (info: UpdateInfo) => {
  console.info('No update available', info);
  updateWindow.webContents.send('update-not-available', info);
};

const onDownloadProgress = (progress: ProgressInfo) => {
  console.info(`Auto-update download progress ${progress.percent}%`);
  updateWindow.webContents.send('download-progress', progress);
};

const onUpdateDownloaded = (info: UpdateInfo) => {
  console.info('Update downloaded', info);
  updateWindow.webContents.send('update-downloaded', info);
};

export default async () => {
  const updateAppWindow = await global.visualCal.windowManager.showUpdateAppWindow();
  if (!updateAppWindow) throw new Error('Update app window is undefined');
  updateWindow = updateAppWindow;
  updateWindow.on('show', () => updateWindow.webContents.send('update-app-ready', 'Checking for updates...'));
  log.transports.console.level = 'debug';
  log.transports.file.level = 'debug';
  autoUpdater.logger = log;
  // autoUpdater.setFeedURL('https://github.com/scottpageindysoft/visualcal/releases/latest');
  autoUpdater.on('error', onError);
  autoUpdater.on('checking-for-update', onCheckingForUpdate);
  autoUpdater.on('update-available', onUpdateAvailable);
  autoUpdater.on('update-not-available', onUpdateNotAvailable);
  autoUpdater.on('download-progress', onDownloadProgress);
  autoUpdater.on('update-downloaded', onUpdateDownloaded);
  await autoUpdater.checkForUpdatesAndNotify();
};
