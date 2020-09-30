import { BrowserWindow, dialog, MenuItem } from 'electron';
import { autoUpdater } from 'electron-updater';

/**
 * updater.js
 *
 * Please use manual update only when it is really required, otherwise please use recommended non-intrusive auto update.
 *
 * Import steps:
 * 1. create `updater.js` for the code snippet
 * 2. require `updater.js` for menu implementation, and set `checkForUpdates` callback from `updater` for the click property of `Check Updates...` MenuItem.
 */


let updater: MenuItem | null;
autoUpdater.autoDownload = false;

autoUpdater.on('error', (error) => {
  dialog.showErrorBox('Error: ', error == null ? "unknown" : (error.stack || error).toString());
});

autoUpdater.on('update-available', async () => {
  const result = await dialog.showMessageBox({
    type: 'info',
    title: 'Found Updates',
    message: 'Found updates, do you want update now?',
    buttons: ['Yes', 'No']
  });
  if (result.response === 0) {
    autoUpdater.downloadUpdate();
  }
  else {
    if (updater) updater.enabled = true;
    updater = null;
  }
});

autoUpdater.on('update-not-available', () => {
  dialog.showMessageBox({
    title: 'No Updates',
    message: 'Current version is up-to-date.'
  });
  if (updater) updater.enabled = true;
  updater = null;
});

autoUpdater.on('update-downloaded', async () => {
  await dialog.showMessageBox({
    title: 'Install Updates',
    message: 'Updates downloaded, application will now quit for update...'
  });
  setImmediate(() => autoUpdater.quitAndInstall());
});

// export this to MenuItem click callback
export async function checkForUpdates(menuItem: MenuItem) {
  updater = menuItem;
  updater.enabled = false;
  await autoUpdater.checkForUpdates();
}
