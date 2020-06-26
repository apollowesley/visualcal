import { ipcRenderer } from 'electron';
import { getAll } from '../main/utils/Procedures';
import path from 'path';
import os from 'os';
import { Red, Nodes, NodeProperties } from 'node-red';

interface NodesModule extends Nodes {
  eachConfig: (cb: (nodeConfig: NodeProperties) => void) => void;
}

interface NodeRed extends Red {
  nodes: NodesModule
}

interface ProcedureRuntimeProperties extends NodeProperties {
  shortName: string;
}

declare const RED: NodeRed;

const getProcedureConfigNode = (): ProcedureRuntimeProperties | undefined => {
  let retVal: ProcedureRuntimeProperties | undefined = undefined;
  RED.nodes.eachConfig(nodeConfig => {
    if (nodeConfig.type === 'procedure-sidebar') {
      retVal = (nodeConfig as ProcedureRuntimeProperties);
    };
  });
  return retVal;
}

interface nodeRedUploadAssetOnEditPrepareThis {
  assetFilename: string;
}

function nodeRedUploadAssetOnEditPrepare(this: nodeRedUploadAssetOnEditPrepareThis) {
  const globalProcedureConfigNode = getProcedureConfigNode();
  const showImage = $('#node-input-showImage');
  const imageSourceRow = $('#image-source-row');
  const urlRow = $('#url-row');
  const assetRow = $('#asset-row');
  const imageInputId = 'vc-image-input';
  const onImageUploaded = (filename: string) => this.assetFilename = filename;
  const imageInputOpts = {
    parent: assetRow,
    inputId: imageInputId,
    formId: 'vc-image-input-form',
    labelText: 'Server Image',
    action: `/api/v1/procedure/assets?procedure=${(globalProcedureConfigNode as any).shortName}`,
    labelClass: 'fa fa-tag'
  };

  assetRow.append(
    `<label for="existing-asset-label"><i class="fa fa-tag"></i> Selected asset</label>
    <label id="existing-asset-label" style="display: inline-block; width: auto;"> ${this.assetFilename}</label>`);

  const asssetUploadFormInfo = createAssetUploadForm(imageInputOpts, onImageUploaded);

  showImage.on('change', function () {
    const showImageChecked = !!$(this).prop('checked');
    if (showImageChecked) {
      imageSourceRow.show();
    } else {
      imageSourceRow.hide();
    }
  }).trigger('change');

  imageSourceRow.on('change', function () {
    const showImageChecked = !!$('#node-input-showImage').prop('checked');
    const imageSource = $('#image-source-row option:selected').val();
    if (showImageChecked) {
      switch (imageSource) {
        case 'asset':
          assetRow.show();
          urlRow.hide();
          break;
        case 'url':
          assetRow.hide();
          urlRow.show();
          break;
      }
    } else {
      assetRow.hide();
      urlRow.hide();
    }
  }).trigger('change');

}

  const createAssetUploadForm = (opts: VisualCalBrowserUtilsFileUploadOptions, onUploaded?: (filename: string) => void): CreateAssetUploadFormResult => {
  const refDocInputDiv = $('<div>') as JQuery<HTMLDivElement>;
  const refDocForm = $('<form>').attr('id', opts.formId) as JQuery<HTMLFormElement>;
  const refDocInputLabel = $('<label>').attr('for', opts.inputId).text(opts.labelText) as JQuery<HTMLLabelElement>;
  const refDocInput = $('<input>').attr('id', opts.inputId).attr('type', 'file').attr('autocomplete', 'off') as JQuery<HTMLInputElement>;

  if (opts.labelClass) refDocInputLabel.attr('class', opts.labelClass);
  if (opts.labelStyle) refDocInputLabel.attr('style', opts.labelStyle);

  if (opts.inputClass) refDocInput.attr('class', opts.inputClass);
  if (opts.inputStyle) refDocInput.attr('style', opts.inputStyle);

  refDocInputDiv.append(refDocForm);
  refDocForm.append(refDocInputLabel);
  refDocForm.append(refDocInput);
  opts.parent.append(refDocInputDiv);

  refDocInput.on('change', function () {
    const refDockInputHTMLElement = refDocInput ? (refDocInput as any)[0] : undefined;
    if (!refDockInputHTMLElement || !(refDockInputHTMLElement as any).files) return;
    const file = (refDockInputHTMLElement as any).files[0];
    refDocForm.attr('action', opts.action);
    const formData = new FormData();
    formData.append('asset', file);
    jQuery.ajax({
      type: 'POST',
      method: 'POST',
      url: refDocForm.attr('action'),
      data: formData,
      processData: false,
      contentType: false,
      cache: false,
      success: () => {
        if (onUploaded) onUploaded(file.name);
      }
    });
  });
  return {
    label: refDocInputLabel,
    input: refDocInput,
    form: refDocForm,
    container: refDocInputDiv
  };
}

window.visualCal = {
  browserUtils: {
    createAssetUploadForm,
    getProcedureConfigNode,
    nodeRedUploadAssetOnEditPrepare
  },
  ipc: ipcRenderer,
  log: {
    result(result: LogicResult) {
      ipcRenderer.send('node-red', result);
    }
  },
  procedures: {
    create: async (info: CreateProcedureInfo) => await Promise.resolve({ name: info.name, shortName: info.shortName || info.name }),
    exists: async (name: string) => await Promise.resolve(true),
    getOne: async (name: string) => await Promise.resolve(undefined),
    getAll: getAll,
    remove: async (name: string) => await Promise.resolve(),
    rename: async (oldName: string, newName: string) => await Promise.resolve()
  },
  dirs: {
    base: path.resolve(__dirname, '..', '..', '..'), // <base>/dist
    html: {
      vue: path.resolve(__dirname, '..', '..', 'renderer'),
      css: path.resolve(__dirname, '..', '..', '..', 'public', 'css'),
      fonts: path.resolve(__dirname, '..', '..', '..', 'public', 'fonts'),
      js: path.resolve(__dirname, '..', '..', '..', 'public', 'js'),
      views: path.resolve(__dirname, '..', '..', '..', 'public', 'views'),
      windows: path.resolve(__dirname, '..', '..', '..', 'public', 'windows')
    },
    renderers: {
      base: path.resolve(__dirname, '..', '..', 'renderers'),
      views: path.resolve(__dirname, '..', '..', 'renderers', 'views'),
      windows: path.resolve(__dirname, '..', '..', 'renderers', 'windows'),
      nodeBrowser: path.resolve(__dirname, '..', '..', 'renderers', 'node-browser')
    },
    procedures: path.join(os.homedir(), '.visualcal', 'procedures'),
    visualCalUser: path.join(os.homedir(), '.visualcal')
  }
}
