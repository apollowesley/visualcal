import { TypedEmitter } from 'tiny-typed-emitter';
import express from 'express';
import http from 'http';
import { hook as frontendVueRequestHook } from './frontend-vue-request-hook';
import path from 'path';

interface Events {
  starting: (expressInstance: express.Express, httpInstancde: http.Server) => void;
  started: (port: number) => void;
  stopping: () => void;
  stopped: () => void;
}

export class ExpressServer extends TypedEmitter<Events> {

  private static fInstance = new ExpressServer();
  public static get instance() { return ExpressServer.fInstance; }

  private fExpress?: express.Express;
  private fServer?: http.Server;

  constructor() {
    super();
    console.info('Loaded');
  }

  get expressInstance() { return this.fExpress; }
  get httpInstance() { return this.fServer; }
  get isRunning() { return this.expressInstance !== undefined && this.httpInstance !== undefined && this.httpInstance.listening; }

  start(port: number) {
    const doStart = async (resolve: (value?: void | PromiseLike<void> | undefined) => void, reject: (reason?: any) => void) => {
      try {
        this.fExpress = express();
        this.fServer = http.createServer(this.fExpress);
        this.emit('starting', this.fExpress, this.fServer);
        this.fExpress.use('/nodemodules', express.static(path.join(global.visualCal.dirs.base, 'node_modules')));
        frontendVueRequestHook(this.fExpress);
        this.fServer.listen(port, '127.0.0.1', () => {
          this.emit('started', port);
          return resolve();
        });
      } catch (error) {
        await this.stop();
        return reject(error);
      }
    };
    return new Promise<void>(doStart);
  }

  stop() {
    const doStop = (resolve: (value?: void | PromiseLike<void> | undefined) => void) => {
      if (this.fServer) {
        this.fServer.close(() => {
          this.fServer = undefined;
          this.fExpress = undefined;
          return resolve();
        });
      } else {
        this.fServer = undefined;
        this.fExpress = undefined;
        return resolve();
      }
    };
    return new Promise<void>(doStop);
  }

}