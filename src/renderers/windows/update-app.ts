import { ipcRenderer } from 'electron';
import { ProgressInfo } from 'electron-builder';
import { UpdateInfo } from 'electron-updater';
import '../window';

const yesButton = document.querySelector('#vc-yes-button') as HTMLButtonElement;
const noButton = document.querySelector('#vc-no-button') as HTMLButtonElement;
const logList = document.querySelector('#vc-log-list') as HTMLUListElement;

const log = (comment: any) => {
  const li = document.createElement('li');
  li.appendChild(document.createTextNode(comment));
  logList.appendChild(li);
}

const onError = (error: Error) => {
  console.error('Auto-update error', error);
  log('Auto-update error');
  log(error);
};

const onCheckingForUpdate = () => {
  console.info('Auto-update checking for updates');
  log('Checking for update');
};

const onUpdateAvailable = (info: UpdateInfo) => {
  console.info('Update available', info);
  log('Update available');
  log(info);
};

const onUpdateNotAvailable = (info: UpdateInfo) => {
  console.info('No update available', info);
  log('No update available');
  log(info);
};

const onDownloadProgress = (progress: ProgressInfo) => {
  console.info(`Auto-update download progress ${progress.percent}%`);
  log(`Auto-update download progress ${progress.percent}%`);
};

const onUpdateDownloaded = (info: UpdateInfo) => {
  console.info('Update downloaded', info);
  log('Update downloaded');
  log(info);
};

ipcRenderer.on('update-app-ready', (_, message: string) => log(message));
ipcRenderer.on('error', (_, error: Error) => onError(error));
ipcRenderer.on('checking-for-update', () => onCheckingForUpdate());
ipcRenderer.on('update-available', (_, info: UpdateInfo) => onUpdateAvailable(info));
ipcRenderer.on('update-not-available', (_, info: UpdateInfo) => onUpdateNotAvailable(info));
ipcRenderer.on('download-progress', (_, progress: ProgressInfo) => onDownloadProgress(progress));
ipcRenderer.on('update-downloaded', (_, info: UpdateInfo) => onUpdateDownloaded(info));
 