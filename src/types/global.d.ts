interface VisualCalConfig {
  httpServer: {
    port: number;
  };
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
        html: {
          windows: string;
          views: string;
          css: string;
          js: string;
          fonts: string;
        },
        renderers: {
          windows: string;
          views: string;
        }
        procedures: string;
        visualCalUser: string;
      },
      windowManager: import('../main/managers/WindowManager').WindowManager,
      user?: User;
    }

  }

}
