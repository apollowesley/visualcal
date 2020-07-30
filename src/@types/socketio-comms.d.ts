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
  assetFilename?: string;
  fileBase64Contents?: string;
}

interface UserInputResponse {
  nodeId: string;
  section: string;
  action: string;
  cancel?: boolean;
  result?: string | number | boolean;
}