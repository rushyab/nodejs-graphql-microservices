import winston from 'winston';
import { NODE_ENV } from '../config';

const levels = {
  ERROR: 0,
  WARN: 1,
  NOTICE: 2,
  INFO: 3,
  DEBUG: 4,
};

const level = () => {
  const env = NODE_ENV;
  const isDevelopment = env === 'development';
  return isDevelopment ? 'DEBUG' : 'WARN';
};

const colors = {
  ERROR: 'red',
  WARN: 'yellow',
  NOTICE: 'magenta',
  INFO: 'green',
  DEBUG: 'white',
};

winston.addColors(colors);

const dateFormat = () => new Date(Date.now()).toUTCString();

type LogObject = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export default class LoggerService {
  public logData: LogObject;

  public route: string;

  public logger: winston.Logger;

  constructor(route: string) {
    this.logData = {};
    this.route = route;

    const logger = winston.createLogger({
      transports: [
        new winston.transports.Console(),
        // TODO - Add Cloudwatch transports
      ],
      format: winston.format.combine(
        winston.format.colorize({ level: true, message: true }),
        winston.format.errors({ stack: true }),
        winston.format.printf((info) => {
          let message = `[${dateFormat()}] | ${info.level} | ${route}.log | ${
            info.message
          }`;
          message =
            Object.keys(info.obj).length !== 0
              ? `${message} | data:${JSON.stringify(info.obj)} | `
              : message;
          message =
            Object.keys(this.logData).length !== 0
              ? `${message} | log_data:${JSON.stringify(this.logData)} | `
              : message;
          return message;
        }),
      ),
      level: level(),
      levels,
    });
    this.logger = logger;
  }

  public setLogData(logData: LogObject): void {
    this.logData = logData;
  }

  public error(message: string, obj: LogObject = {}): void {
    this.logger.log('ERROR', message, {
      obj,
    });
  }

  public warn(message: string, obj: LogObject = {}): void {
    this.logger.log('WARN', message, {
      obj,
    });
  }

  public notice(message: string, obj: LogObject = {}): void {
    this.logger.log('NOTICE', message, {
      obj,
    });
  }

  public info(message: string, obj: LogObject = {}): void {
    this.logger.log('INFO', message, {
      obj,
    });
  }

  public debug(message: string, obj: LogObject = {}): void {
    this.logger.log('DEBUG', message, {
      obj,
    });
  }
}
