export interface Config {
  isProduction: boolean;
  version: string;
  host: string;
  port: number;
  maxEventListeners: number;
  authSecret: string;
  dbhost: string;
  dbUser?: string;
  dbPass?: string;
  dbCollection: string;
  useUserRoles: boolean;
  dirBase: string;
  proceduresFilePath: string;
  dirBaseAssets: string;
  dirBaseDrivers: string;
  dirBaseProcedures: string;
  dirBaseFrontEnd: string;
  dirBaseLogicProjects: string; // obsolete
  dirBaseTmsEditor: string;
  dirBasePascalSources: string;
  dirBaseTmsCompiler: string;
  dirProcedureSectionDefault: string;
  equipmentCategoriesUrl?: string;
  logic: {
    userDir: string;
    exportGlobalContextKeys: boolean;
    flowFile: string;
    flowFilePretty: boolean;
    projectsEnabled: boolean; // obsolete
    mqttReconnectTime: number;
    serialReconnectTime: number;
    socketReconnectTime: number;
    socketTimeout: number;
    tcpMsgQueueSize: number;
    httpRequestTimeout: number;
    debugMaxLength: number;
    nodeMsgBufferMaxLength: number;
    tlsConfigDisableLocalFiles: boolean;
    debugUseColors: boolean;
    credentialSecret: string;
    httpAdminRoot: string;
    httpNodeRoot: string;
    nodesDir?: string;
    httpStatic: string;
    apiMaxLength: string;
    adminUsername: string;
    adminPassword: string;
    logConsoleLevel: string;
    logConsoleMetrics: boolean;
    logConsoleAudit: boolean;
    darkThemeCss: string;
    paletteCategories?: string[];
    paletteCatalogues?: string[];
  };
}