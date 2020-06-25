interface VisualCalConfig {
  httpServer: {
    port: number;
  };
}

interface WindowInfo {
  id: VisualCalWindow;
  type: WindowPathType;
  path: string;
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
        get: (id: string) => Buffer;
      }
      dirs: {
        base: string;
        html: {
          getWindowInfo: (id: VisualCalWindow) => WindowInfo;
          vue: string;
          windows: string;
          views: string;
          css: string;
          js: string;
          fonts: string;
        },
        renderers: {
          base: string;
          windows: string;
          views: string;
          nodeBrowser: string;
        }
        procedures: string;
        visualCalUser: string;
      },
      windowManager: import('../main/managers/WindowManager').WindowManager,
      user?: User;
    }

  }

}
