import { createLogger, format, transports } from 'winston';
import { ConsoleWindowTransport } from './ConsoleWindowTransport';
const { combine, timestamp, label, colorize } = format;
import { isDev } from '../utils/is-dev-mode';

export const create = () => {
  return createLogger({
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
}
