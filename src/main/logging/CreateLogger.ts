import { createLogger, format, transports, Logger } from 'winston';
import { ConsoleWindowTransport } from './ConsoleWindowTransport';
const { combine, timestamp, label, colorize } = format;
import { isDev } from '../utils/is-dev-mode';
import { ipcMain, IpcMainEvent, BrowserWindow } from 'electron';
import { IpcChannels } from '../../@types/constants';

let logger: Logger;

const logWindowEvent = (type: string, event: IpcMainEvent, data: any, ...args: any[]) => {
  try {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window && window.visualCal) {
      const windowMsg = { windowId: window.visualCal.id, msg: data };
      switch (type) {
        case IpcChannels.log.result:
          logger.info(windowMsg.msg, { windowId: windowMsg.windowId }, args);
          break;
        case IpcChannels.log.info:
          logger.info(windowMsg.msg, { windowId: windowMsg.windowId }, args);
          break;
        case IpcChannels.log.warn:
          logger.warn(windowMsg.msg, { windowId: windowMsg.windowId }, args);
          break;
        case IpcChannels.log.error:
          logger.error(windowMsg.msg, { windowId: windowMsg.windowId }, args);
          break;
      }
    } else {
      logger.error('Could not find window or window.visualCal is undefined.  Original message', { type: type, data: data });
    }
  } catch (error) {
    logger.error(error);
  }
}

export const create = () => {
  logger = createLogger({
    transports: [
      new transports.Console({
        level: isDev() ? 'debug' : 'info',
        format: combine(
        timestamp(),
        label({ label: 'Main' }),
        colorize()
        ),
        handleExceptions: true
      }),
      new ConsoleWindowTransport()
    ]
  });

  ipcMain.on(IpcChannels.log.result, (event, result: LogicResult) => logWindowEvent(IpcChannels.log.result, event, result));
  ipcMain.on(IpcChannels.log.info, (event, msg: any, ...args: any[]) => logWindowEvent(IpcChannels.log.result, event, msg, args));
  ipcMain.on(IpcChannels.log.warn, (event, msg: any, ...args: any[]) => logWindowEvent(IpcChannels.log.result, event, msg, args));
  ipcMain.on(IpcChannels.log.error, (event, msg: any, ...args: any[]) => logWindowEvent(IpcChannels.log.result, event, msg, args));
  return logger;
}
