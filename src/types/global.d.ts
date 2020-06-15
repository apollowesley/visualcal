interface VisualCalConfig {
  httpServer: {
    port: number;
  };
}

interface LogEntry {
  timestamp: Date;
  origin: string;
  msg: string;
}

interface User {
  email: string;
}

interface LoggerMessage {
  level: string;
}

interface Result extends LoggerMessage {
  timestamp: Date;
  source: string;
  message: string;
}

interface LogicResult extends Result {
  unitId: string;
  value: number;
}

declare const __static: string;

declare module NodeJS {

  interface Global {

    visualCal: {
      isDev: boolean,
      isMac: boolean,
      config: VisualCalConfig;
      logger: import('winston').Logger,
      assets: {
        basePath: string;
        get: (name: string) => Buffer;
      }
      dirs: {
        base: string;
        html: string;
        renderers: string;
        procedures: string;
        visualCalUser: string;
      },
      windowManager: import('../main/managers/WindowManager').WindowManager,
      user?: User;
    }

  }

}
