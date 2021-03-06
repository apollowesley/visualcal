import('../window'); // The script we are in now get's preloaded by the BrowserWindow (because we can't run with nodeIntegration enabled).  So we import window here, whereas normally we would preload window.js.
import { Red, Nodes, NodeProperties } from 'node-red';

// preload.js
const _setImmediate = setImmediate
const _clearImmediate = clearImmediate
process.once('loaded', () => {
  global.setImmediate = _setImmediate;
  global.clearImmediate = _clearImmediate;
});

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

// TODO: Use the following as an example for opening a file on the user's computer.  Later the file can be saved using windows.showSaveFileDialog, or handled in main process
// window.onload = () => {
//   const opts: OpenDialogOptions = {
//     title: 'Testing',
//     message: 'Select a file'
//   }
//   ipcRenderer.once(IpcChannels.windows.showOpenFileDialog.response, (_, response: any) => {
//     console.info(response);
//   });
//   window.visualCal.electron.showOpenFileDialog(opts);
// }

// Prevent node-red from stopping the BrowserWindow from being closed.
// TODO: Check if moving this to the main process is a better solution.
window.addEventListener('beforeunload', (ev) => {
  ev.stopImmediatePropagation();
  ev.stopPropagation();
  ev.preventDefault();
});

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
