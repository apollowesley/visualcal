interface ProcedureRuntimeProperties extends NodeProperties {
  shortName: string;
}

interface CreateAssetUploadFormResult {
  label: JQuery<HTMLLabelElement>;
  input: JQuery<HTMLInputElement>;
  form: JQuery<HTMLFormElement>;
  container: JQuery<HTMLElement>;
}

interface Options {
  parent: JQuery;
  inputId: string;
  formId: string;
  labelText: string;
  action: string;
  labelClass?: string;
  labelStyle?: string;
  inputClass?: string;
  inputStyle?: string;
}

interface VisualCalBrowserUtils {
  getProcedureConfigNode(): ProcedureRuntimeProperties | undefined;
  fileUpload(opts: Options, onUploaded?: (filename: string) => void): void;
  nodeRedUploadAssetOnEditPrepare(): void;
}

interface Window {
  electron: {
    ipcRenderer: import('electron').IpcRenderer;
  };
  moment: typeof import('moment');
  visualCal: {
    ipc: import('electron').IpcRenderer,
    browserUtils: VisualCalBrowserUtils,
    log: {
      result(result: LogicResult): void;
    }
  };
}
