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
      config: VisualCalConfig;
      logs: {
        main: LogEntry[]
      },
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
      mainWindow?: import('electron').BrowserWindow;
      consoleWindow?: import('electron').BrowserWindow;
      user?: User;
    }

  }

}
