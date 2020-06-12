import { createLogger, format, transports } from 'winston';
import isDev from 'electron-is-dev';
import { ConsoleWindowTransport } from './ConsoleWindowTransport';
const { combine, timestamp, label, colorize } = format;

export const create = () => {
  return createLogger({
    transports: [
      new transports.Console({
        level: isDev ? 'debug' : 'info',
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
}
