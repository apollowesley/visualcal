import { autoUpdater, UpdateInfo } from 'electron-updater';
import { ProgressInfo } from 'electron-builder';
import log from 'electron-log';
import { BrowserWindow } from 'electron';
import { isDev } from '../utils/is-dev-mode';

let updateWindow: BrowserWindow | null = null;

const onError = (error: Error) => {
  console.error('Auto-update error', error);
  if (!updateWindow) return;
  updateWindow.webContents.emit('error', error);
};

const onCheckingForUpdate = () => {
  console.info('Auto-update checking for updates');
  if (!updateWindow) return;
  updateWindow.webContents.send('checking-for-update');
};

const onUpdateAvailable = async (info: UpdateInfo) => {
  console.info('Update available', info);
  const updateAppWindow = await global.visualCal.windowManager.showUpdateAppWindow();
  if (!updateAppWindow) return;
  updateWindow = updateAppWindow;
  updateWindow.on('show', () => {
    if (!updateWindow) return;
    updateWindow.webContents.send('update-available', info);
    updateWindow.webContents.send('update-app-ready', 'Checking for updates...')
  });
};

const onUpdateNotAvailable = (info: UpdateInfo) => {
  console.info('No update available', info);
  if (!updateWindow) return;
  updateWindow.webContents.send('update-not-available', info);
};

const onDownloadProgress = (progress: ProgressInfo) => {
  console.info(`Auto-update download progress ${progress.percent}%`);
  if (!updateWindow) return;
  updateWindow.webContents.send('download-progress', progress);
};

const onUpdateDownloaded = (info: UpdateInfo) => {
  console.info('Update downloaded', info);
  if (!updateWindow) return;
  updateWindow.webContents.send('update-downloaded', info);
};

export default async () => {
  if (isDev()) return Promise.resolve();
  log.transports.console.level = 'debug';
  log.transports.file.level = 'debug';
  autoUpdater.logger = log;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowDowngrade = false;
  autoUpdater.allowPrerelease = true;
  autoUpdater.on('error', onError);
  autoUpdater.on('checking-for-update', onCheckingForUpdate);
  autoUpdater.on('update-available', onUpdateAvailable);
  autoUpdater.on('update-not-available', onUpdateNotAvailable);
  autoUpdater.on('download-progress', onDownloadProgress);
  autoUpdater.on('update-downloaded', onUpdateDownloaded);
  await autoUpdater.checkForUpdates();
};
