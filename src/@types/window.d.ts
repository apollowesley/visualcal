/// <reference types="jquery" />
/// <reference types="node-red" />

/** Unique node identifier. */
type NodeId = string;
/** Node type name. */
type NodeType = string;

interface NodeProperties {
  /** This node's unique identifier. */
  id: NodeId;
  /** The type name for this node. */
  type: NodeType;
  /**
   * The UI visible name for this node. Many nodes
   * allow the user to pick the name and provide
   * a fallback name, if they leave it blank.
   */
  name: string;
}

interface ProcedureRuntimeProperties extends NodeProperties {
  shortName: string;
}

interface CreateAssetUploadFormResult {
  label: JQuery<HTMLLabelElement>;
  input: JQuery<HTMLInputElement>;
  form: JQuery<HTMLFormElement>;
  container: JQuery<HTMLElement>;
}

interface VisualCalBrowserUtilsFileUploadOptions {
  parent: JQuery;
  inputId: string;
  formId: string;
  labelText: string;
  labelClass?: string;
  labelStyle?: string;
  inputClass?: string;
  inputStyle?: string;
}

interface VisualCalBrowserUtils {
  getProcedureConfigNode(): ProcedureRuntimeProperties | undefined;
  createAssetUploadForm(opts: VisualCalBrowserUtilsFileUploadOptions, onUploaded?: (filename: string) => void): void;
  nodeRedUploadAssetOnEditPrepare(): void;
}

interface Window {
  moment: typeof import('moment');
  visualCal: VisualCalWindowAugment;
}
