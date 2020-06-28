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

    visualCal: VisualCalGlobalAugment;

  }

}
