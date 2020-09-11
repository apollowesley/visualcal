import { Red, NodeProperties, Node as NodeRedNode } from 'node-red';

interface NodeRedAdminAuth {
  type: string;
  users: (username: string) => Promise<unknown>;
  authenticate: (username: string, password: string) => Promise<unknown>;
  tokens?: unknown[];
}

interface NodeRedLogHandlerEntry {
  timestamp: number;
  level: number;
  msg: any;
}

interface NodeRedLogHandler {
  (entry: NodeRedLogHandlerEntry): void;
}

interface NodeRedLog {
  level: string;
  metrics?: boolean;
  audit?: boolean;
  handler?: (settings: any) => NodeRedLogHandler;
}

interface NodeRedLogging {
  console?: NodeRedLog;
  electronLog?: NodeRedLog;
}

export interface Settings {
  adminAuth?: NodeRedAdminAuth;
  credentialSecret?: string;
  storageModule?: any;
  readOnly?: boolean;
  uiPort?: number;
  userDir: string;
  nodesDir: string | undefined;
  httpStatic?: string;
  driversRoot: string;
  httpAdminRoot: string;
  httpNodeRoot: string;
  flowFile?: string;
  exportGlobalContextKeys?: boolean;
  flowFilePretty?: boolean;
  socketTimeout?: number;
  tcpMsgQueueSize?: number;
  currentProcedureShortName?: string;
  paletteCategories?: string[];
  getCommunicationInterfaceForDevice: (deviceName: string) => ICommunicationInterface | undefined;
  getDriverForDevice: (deviceName: string) => IControllableDevice | null;
  getAllNodes(): NodeRedRuntimeNode[];
  findNodesByType(type: string): NodeRedRuntimeNode[];
  findNodeById(id: string): NodeRedRuntimeNode | undefined;
  getNodeConfig(id: string, configName: string): NodeRedRuntimeNode | undefined;
  functionGlobalContext: VisualCalContextGlobal;
  logging?: NodeRedLogging;
  editorTheme?: {
    projects?: {
      enabled: boolean;
    };
    page?: {
      title: string;
      favicon?: string;
      css?: string;
      scripts?: string;
    };
    header?: {
      title: string;
      image?: string;
      url?: string;
    };
    menu?: {},
    deployButton?: {
      type?: string;
      label?: string;
      icon?: string;
    };
    login?: {
      title?: string;
      image: string;
    };
    palette?: {
      editable?: boolean;
      catalogues?: string[];
      theme?: string[];
    };
  };
}

/**
 * Node-RED node creation api.
 */
export interface NodeRed extends Red {
  _: import('lodash').__;
  /** Node lifecycle management api. Used by all nodes. */
  init(httpServer: import('http').Server, userSettings: Settings): void;
  start(): Promise<void>;
  stop(): Promise<void>;
  httpAdmin: import('express').Application;
  httpNode: import ('express').Application;
  auth: NodeRedAuthModule;
  events: import('events').EventEmitter;
  runtime: NodeRedRuntimeModule;
  server: import('http').Server;
  util: NodeRedUtilModule;
  settings: Settings;
  /** Returns the version of the running Node-RED environment. */
  version(): string;
}

interface NodeRedContextBase {
  get(name: string): unknown;
  set(name: string, value: unknown): void;
}

type NodeRedContextFlow = NodeRedContextBase

export type LibraryType = 'flows' | 'functions' | 'templates';

interface VisualCalContextGlobal {
  indySoftLogicServerVersion: string;
  visualCal: any;
}

interface NodeRedRuntimeContextGlobal extends NodeRedContextBase {
  indySoftLogicServerVersion: string;
}

interface NodeRedContext {
  global: NodeRedRuntimeContextGlobal;
  flow: NodeRedContextFlow;
}

export interface NodeRedRuntimeNode extends NodeRedNode {
  context(): NodeRedContext;
  wires?: string[];
}

interface NodeRedGlobalCommsConnection {
  removeMe?: boolean;
}

interface NodeRedRuntimeOptions {
  user: unknown;
}

interface NodeRedAuthModule {
  needsPermission(permission: string): import('express').NextFunction;
}

interface NodeRedRuntimeCommsConnectionOptions extends NodeRedRuntimeOptions {
  client: NodeRedGlobalCommsConnection;
}

interface NodeRedRuntimeCommsSubscriptionOptions extends NodeRedRuntimeCommsConnectionOptions {
  topic: string;
}

interface NodeRedRuntimeCommsModule {
  addConnection(opts: NodeRedRuntimeCommsConnectionOptions): Promise<any>;
  removeConnection(opts: NodeRedRuntimeCommsConnectionOptions): Promise<any>;
  subscribe(opts: NodeRedRuntimeCommsSubscriptionOptions): Promise<any>;
  unsubscribe(opts: NodeRedRuntimeCommsSubscriptionOptions): Promise<any>;
}

interface NodeRedRuntimeContextOptions extends NodeRedRuntimeOptions {
  scope: string;
  id: string;
  store: string;
  key: string;
  req?: any;
}

interface NodeRedRuntimeContextModule {
  delete(opts: NodeRedRuntimeContextOptions): Promise<unknown>;
  getValue(opts: NodeRedRuntimeContextOptions): Promise<unknown>;
}

interface NodeRedRuntimeModuleNodes {
  init: () => void;
  load: () => void;
  // eslint-disable-next-line
  createNode: (node: NodeProperties, def: any) => void;
  getNode: (id: string) => NodeRedNode;
  eachNode: (cb: (node: NodeRedNode) => void) => void;
  // eslint-disable-next-line
  getContext: (nodeId: string, flowId: string) => any;
}

interface NodeRedRuntimeModule {
  comms: NodeRedRuntimeCommsModule;
  context: NodeRedRuntimeContextModule;
  events: import('events').EventEmitter;
  // eslint-disable-next-line
  flows: any;
  // eslint-disable-next-line
  library: any;
  nodes: NodeRedRuntimeModuleNodes;
  // eslint-disable-next-line
  projects: any;
  // eslint-disable-next-line
  settings: any;
  isStarted(opts: NodeRedRuntimeOptions): Promise<boolean>;
  version(opts: NodeRedRuntimeOptions): Promise<string>;
}

interface NodeRedUtilModule {
  cloneMessage(msg: unknown): any;
  compareObjects(obj1: unknown, obj2: unknown): boolean;
  encodeObject(msg: any, opts: any): any;
  ensureBuffer(o: unknown): string;
  ensureString(o: unknown): string;
  evaluateEnvProperty(value: string, node: NodeRedNode): string;
  evaluateJSONataExpression(expr: any, msg: any, callback?: any): unknown;
  evaluateNodeProperty(value: string, type: string, node: NodeRedNode, msg: any, callback?: any): unknown;
  generateId(): string;
  getMessageProperty(msg: any, expr: string): unknown;
  getObjectProperty(msg: any, expr: string): unknown;
  normaliseNodeTypeName(name: string): string;
  normalisePropertyExpression(str: string): Array<unknown>;
  parseContextStore(key: string): any;
  prepareJSONataExpression(value: string, node: NodeRedNode): any;
  setMessageProperty(msg: any, prop: string, value: unknown, createMissing: boolean): void;
  setObjectProperty(msg: any, prop: string, value: unknown, createMissing: boolean): void;
}

interface NodeRedCommsMessage {
  topic: string;
  data: unknown;
}

interface NodeRedNodeUIPropertiesDefaultsValue {
  value: unknown;
  prefix?: unknown;
  validate?: unknown;
}

interface NodeRedNodeUIPropertiesDefaults {
  name: NodeRedNodeUIPropertiesDefaultsValue;
}

export interface NodeRedNodeUIProperties extends NodeProperties {
  category: string;
  defaults: any;
  credentials?: any;
  inputs: number;
  outputs: number;
  color: string;
  paletteLabel: string | any;
  label: string | any;
  labelStyle: string | any;
  inputLabels?: Array<string> | any;
  outputLabels?: Array<string> | any;
  icon: string;
  align?: 'left' | 'right';
  button?: any;
  oneditprepare?: any;
  oneditsave?: any;
  oneditcancel?: any;
  oneditdelete?: any;
  oneditresize?: any;
  onpaletteadd?: any;
  onpaletteremove?: any;
}

export interface NodeRedNodeMessage {
  _msgid?: string;
  // eslint-disable-next-line
  topic?: any;
  // eslint-disable-next-line
  payload?: any;
}

export interface NodeRedNodeSendFunction {
  (data?: unknown): void;
}

export interface NodeRedNodeDoneFunction {
  (): void;
}

interface VisualCalCommsMessageData {
  source: 'logic' | 'frontend';
  type: string;
}

interface VisualCalCommsLogicMessageData {
  source: 'logic';
  type: string;
}

interface VisualCalCommsFrontendMessageData {
  source: 'frontend';
  type: 'action';
  actionName: string;
}

interface VisualCalCommsFrontendActionMessageData {
  source: 'frontend';
  type: 'action';
  actionName: string;
  actionType: 'start' | 'stop';
}

interface VisualCalCommsMessage extends NodeRedCommsMessage {
  data: VisualCalCommsMessageData;
}

interface VisualCalCommsLogicMessage extends VisualCalCommsMessage {
  data: VisualCalCommsLogicMessageData;
}

interface VisualCalCommsFrontendMessage extends VisualCalCommsMessage {
  data: VisualCalCommsFrontendMessageData;
}

interface VisualCalCommsFrontendActionMessage extends VisualCalCommsFrontendMessage {
  data: VisualCalCommsFrontendActionMessageData;
}

interface CurrentProcedureName {
  (): Promise<string | boolean>;
}


// ***** LOGIC NODES *****

interface VisualCalNodeRedNodeInputMessagePayload {
  sessionId?: string;
  runId?: string;
  section?: string;
  action?: string;
}

export interface VisualCalNodeRedNodeInputMessage extends NodeRedNodeMessage {
  payload?: VisualCalNodeRedNodeInputMessagePayload;
}

export interface NodeResetOptions {
  targetId: string;
}

export interface NodeRedCommunicationInterfaceRuntimeNode extends NodeRedRuntimeNode {
  isDevice: boolean;
  isGenericDevice: boolean;
  deviceDriverRequiredCategories: string[];
  deviceConfigNode: DeviceConfigurationNode;
  communicationInterface?: ICommunicationInterface;
  device?: IControllableDevice;
  specificDriverInfo?: DriverInfo;
}

export interface DeviceConfigurationNode extends NodeRedRuntimeNode {
  unitId: string;
}

// ***** node-red catalogue *****

 interface NodeRedCatalogueModule {
  id: string;
  version: string;
  description: string;
  keywords: string[];
  updated_at: Date;
  url: string;
}

interface NodeRedCatalogue {
  name: string;
  updated_at: Date;
  modules: NodeRedCatalogueModule[];
}

interface LogicNodesPackageJson {
  name: string;
  description: string;
  version: string;
  keywords?: string[];
  'node-red': {
    // eslint-disable-next-line
    nodes: Record<string, any>;
  };
}
