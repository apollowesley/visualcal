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
  dataType: 'none' | 'string' | 'float' | 'integer' | 'boolean';
  inputMin?: number;
  inputMax?: number;
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
