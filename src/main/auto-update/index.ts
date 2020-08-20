import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

export default async () => {
    log.transports.console.level = 'debug';
    log.transports.file.level = 'debug';
    autoUpdater.logger = log;
    autoUpdater.setFeedURL('https://github.com/scottpageindysoft/visualcal/releases/latest');
    await autoUpdater.checkForUpdatesAndNotify();
}
