interface ActionStatus {
  name: string;
  isRunning: boolean;
}

interface SectionStatus {
  name: string;
  shortName: string;
  actions: ActionStatus[];
}

interface ProcedureStatus {
  name: string;
  shortName: string;
  sections: SectionStatus[];
}

interface LogicServerStatus {
  isRunning: boolean;
}

interface ServerStatus {
  logicServer: LogicServerStatus;
  procedure: ProcedureStatus | null;
}

interface InstructionRequest {
  nodeId: string;
  type: string;
  section: string;
  action: string;
  ok: boolean;
  cancel: boolean;
  title?: string;
  text?: string;
  showImage: boolean;
  imageSource?: 'asset' | 'url';
  assetFilename?: string;
  imageUrl?: string;
}

interface InstructionResponse {
  nodeId: string;
  section: string;
  action: string;
  cancel?: boolean;
  // eslint-disable-next-line
  result?: any;
}

interface UserInputRequest {
  nodeId: string;
  type: string;
  section: string;
  action: string;
  ok: boolean;
  cancel: boolean;
  title: string;
  text: string;
  append?: string;
  dataType: 'string' | 'float' | 'integer' | 'boolean';
  showImage: boolean;
  imageSource?: 'asset' | 'url';
  assetFilename?: string;
  imageUrl?: string;
}

interface UserInputResponse {
  nodeId: string;
  section: string;
  action: string;
  cancel?: boolean;
  result?: string | number | boolean;
}