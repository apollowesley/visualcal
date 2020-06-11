interface VisualCalConfig {
  appIcon: string;
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
        procedures: string;
        visualCalUser: string;
      },
      windowManager: import('./main/managers/WindowManager').WindowManager,
      user?: User;
    }

  }

}
