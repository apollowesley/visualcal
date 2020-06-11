import { createLogger, format, transports } from 'winston';
import isDev from 'electron-is-dev';
const { combine, timestamp, label } = format;

export const create = () => {
  return createLogger({
    transports: [
      new transports.Console({
        level: isDev ? 'debug' : 'info',
        format: combine(
        timestamp(),
        label({ label: 'Main' })
        ),
        handleExceptions: true
      })
    ]
  });
}
