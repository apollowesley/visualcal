import { Red, NodeProperties, Node as NodeRedNode } from 'node-red';
import { NodeRedFlowNode } from './node-red-info';
import { DriverInfo } from './logic-drivers';

export interface NodeRedAdminAuth {
  type: string;
  users: (username: string) => Promise<unknown>;
  authenticate: (username: string, password: string) => Promise<unknown>;
  tokens?: unknown[];
}

export interface NodeRedLog {
  level: string;
  metrics?: boolean;
  audit?: boolean;
  handler?: () => void;
}

export interface NodeRedLogging {
  console?: NodeRedLog;
  websock?: NodeRedLog;
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
  onActionStateChange: (node: NodeRedNode, options: NotifiyFrontendActionStateChangeOptions) => void;
  onActionResult: (options: NotifyFrontendActionResultOptions) => void;
  onShowInstruction: (node: NodeRedNode, options: InstructionRequest) => void;
  onGetUserInput: (node: NodeRedNode, options: UserInputRequest) => void;
  onComment: (source: NotificationSource, node: NodeRedNode, type: NotificationCommentType, comment: string) => void;
  getCommunicationInterface: (name: string) => ICommunicationInterface | undefined;
  getCommunicationInterfaceForDevice: (deviceName: string) => ICommunicationInterface | undefined;
  getDriverForDevice: (deviceName: string) => Promise<IControllableDevice | null>;
  getAllNodes(): NodeRedRuntimeNode[];
  findNodesByType(type: string): NodeRedRuntimeNode[];
  findNodeById(id: string): NodeRedRuntimeNode | undefined;
  getNodeConfig(id: string, configName: string): NodeRedRuntimeNode | undefined;
  resetAllConnectedNodes(startFrom: NodeRedRuntimeNode, options?: NodeResetOptions): void;
  resetAllConnectedInstructionNodes(startFrom: NodeRedRuntimeNode): void;
  enableAllCommunicationInterfaces(): void;
  disableAllCommunicationInterfaces(): void;
  getProcedureStatus(): ProcedureStatus | null;
  getSectionNodes(): SectionRuntimeNode[];
  getActionNodesForSection(sectionShortName: string): ActionStartRuntimeNode[];
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

export interface NodeRedContextBase {
  get(name: string): unknown;
  set(name: string, value: unknown): void;
}

type NodeRedContextFlow = NodeRedContextBase

export type LibraryType = 'flows' | 'functions' | 'templates';

export interface VisualCalContextGlobal {
  indySoftLogicServerVersion: string;
  visualCal: any;
}

export interface NodeRedRuntimeContextGlobal extends NodeRedContextBase {
  indySoftLogicServerVersion: string;
}

export interface NodeRedContext {
  global: NodeRedRuntimeContextGlobal;
  flow: NodeRedContextFlow;
}

export interface NodeRedRuntimeNode extends NodeRedNode {
  context(): NodeRedContext;
  wires?: string[];
}

export interface NodeRedGlobalCommsConnection {
  removeMe?: boolean;
}

export interface NodeRedRuntimeOptions {
  user: unknown;
}

export interface NodeRedAuthModule {
  needsPermission(permission: string): import('express').NextFunction;
}

export interface NodeRedRuntimeCommsConnectionOptions extends NodeRedRuntimeOptions {
  client: NodeRedGlobalCommsConnection;
}

export interface NodeRedRuntimeCommsSubscriptionOptions extends NodeRedRuntimeCommsConnectionOptions {
  topic: string;
}

export interface NodeRedRuntimeCommsModule {
  addConnection(opts: NodeRedRuntimeCommsConnectionOptions): Promise<any>;
  removeConnection(opts: NodeRedRuntimeCommsConnectionOptions): Promise<any>;
  subscribe(opts: NodeRedRuntimeCommsSubscriptionOptions): Promise<any>;
  unsubscribe(opts: NodeRedRuntimeCommsSubscriptionOptions): Promise<any>;
}

export interface NodeRedRuntimeContextOptions extends NodeRedRuntimeOptions {
  scope: string;
  id: string;
  store: string;
  key: string;
  req?: any;
}

export interface NodeRedRuntimeContextModule {
  delete(opts: NodeRedRuntimeContextOptions): Promise<unknown>;
  getValue(opts: NodeRedRuntimeContextOptions): Promise<unknown>;
}

export interface NodeRedRuntimeModuleNodes {
  init: () => void;
  load: () => void;
  // eslint-disable-next-line
  createNode: (node: NodeProperties, def: any) => void;
  getNode: (id: string) => NodeRedNode;
  eachNode: (cb: (node: NodeRedNode) => void) => void;
  // eslint-disable-next-line
  getContext: (nodeId: string, flowId: string) => any;
}

export interface NodeRedRuntimeModule {
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

export interface NodeRedUtilModule {
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

export interface NodeRedCommsMessage {
  topic: string;
  data: unknown;
}

export interface NodeRedNodeUIPropertiesDefaultsValue {
  value: unknown;
  prefix?: unknown;
  validate?: unknown;
}

export interface NodeRedNodeUIPropertiesDefaults {
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

export interface VisualCalCommsMessageData {
  source: 'logic' | 'frontend';
  type: string;
}

export interface VisualCalCommsLogicMessageData {
  source: 'logic';
  type: string;
}

export interface VisualCalCommsFrontendMessageData {
  source: 'frontend';
  type: 'action';
  actionName: string;
}

export interface VisualCalCommsFrontendActionMessageData {
  source: 'frontend';
  type: 'action';
  actionName: string;
  actionType: 'start' | 'stop';
}

export interface VisualCalCommsMessage extends NodeRedCommsMessage {
  data: VisualCalCommsMessageData;
}

export interface VisualCalCommsLogicMessage extends VisualCalCommsMessage {
  data: VisualCalCommsLogicMessageData;
}

export interface VisualCalCommsFrontendMessage extends VisualCalCommsMessage {
  data: VisualCalCommsFrontendMessageData;
}

export interface VisualCalCommsFrontendActionMessage extends VisualCalCommsFrontendMessage {
  data: VisualCalCommsFrontendActionMessageData;
}

export interface CurrentProcedureName {
  (): Promise<string | boolean>;
}


// ***** LOGIC NODES *****
export interface SectionNode extends NodeRedFlowNode {
  shortName: string;
}



export interface VisualCalNodeRedNodeInputMessagePayload {
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

export interface ProcedureRuntimeNode extends NodeRedRuntimeNode {
  shortName: string;
}

export interface ProcedureRuntimeProperties extends NodeRedFlowNode {
  shortName: string;
}

export interface SectionRuntimeNode extends NodeRedRuntimeNode {
  shortName: string;
}

export interface SectionRuntimeProperties extends NodeRedFlowNode {
  shortName: string;
}

export interface ActionStartRuntimeNode extends NodeRedRuntimeNode {
  sessionId?: string;
  runId?: string;
  section?: SectionRuntimeNode;
  isRunning: boolean;
}

export interface ActionStartRuntimeProperties extends NodeRedFlowNode {
  sectionConfigId: string;
}

export interface DeviceConfigurationNode extends NodeRedRuntimeNode {
  unitId: string;
}

// ***** node-red catalogue *****

 export interface NodeRedCatalogueModule {
  id: string;
  version: string;
  description: string;
  keywords: string[];
  updated_at: Date;
  url: string;
}

export interface NodeRedCatalogue {
  name: string;
  updated_at: Date;
  modules: NodeRedCatalogueModule[];
}

export interface LogicNodesPackageJson {
  name: string;
  description: string;
  version: string;
  keywords?: string[];
  'node-red': {
    // eslint-disable-next-line
    nodes: Record<string, any>;
  };
}
