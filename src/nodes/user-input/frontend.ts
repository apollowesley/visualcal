import type { NodeRedEditorClient, NodeRedNodeUIProperties } from '..';
import type { Asset } from '../../main/managers/AssetManager';
import type { OnEditPrepareThis } from './types';

declare const RED: NodeRedEditorClient;

const IndySoftUserInputNodeDef: NodeRedNodeUIProperties = {
  color: '#d3d936',
  category: 'User',
  defaults: {
    name: { value: '' },
    description: { value: '' },
    title: { value: '', required: true },
    text: { value: '', required: true },
    append: { value: '', required: false },
    dataType: { value: 'string', required: true },
    showImage: { value: false, required: true },
    assetFilename: { value: '', required: false }
  },
  inputs: 1,
  outputs: 1,
  icon: 'font-awesome/fa-question-circle',
  label: function(this: OnEditPrepareThis) {
    const isInstruction = this.dataType === 'none';
    const instructionOrInput = isInstruction ? 'Instruction' : 'Input';
    const dataTypeOrBlank = isInstruction ? '' : `${this.dataType} - `;
    return this.name || `${instructionOrInput}: ${dataTypeOrBlank}${this.title}`;
  },
  labelStyle: function(this: OnEditPrepareThis) {
    return this.name ? 'node_label_italic' : '';
  },
  paletteLabel: 'User Input',
  oneditprepare: function(this: OnEditPrepareThis) {
    const inputAssetFilename = document.getElementById('node-input-assetFilename') as HTMLInputElement;
    const inputAppendInputRow = document.getElementById('input-append-row') as HTMLInputElement;
    const inputDataType = document.getElementById('node-input-dataType') as HTMLInputElement;
    const imageInput = document.getElementById('image-input') as HTMLInputElement;
    const assetsEditableList = $('assets-ordered-list');
    if (!inputAssetFilename || !inputAppendInputRow || !inputDataType || !imageInput || !assetsEditableList) throw new Error('indysoft-user-input is missing required HTML elements');
    const inputAppendInputRowDisplay = inputAppendInputRow.style.display;
    inputDataType.onchange = () => {
      if (inputDataType.value === 'none') {
        inputAppendInputRow.style.display = 'none';
      } else {
        inputAppendInputRow.style.display = inputAppendInputRowDisplay;
      }
    };
    inputDataType.dispatchEvent(new Event('change'));
    imageInput.addEventListener('input', async () => {
      if (!imageInput.files) throw new Error('Expected a FileList, but got null');
      const files: Asset[] = [];
      for (const file of imageInput.files) files.push({ name: file.name, content: await file.arrayBuffer() });
      // Watch for responses and send the file to the main process
      window.visualCal.electron.ipc.once(window.visualCal.ipcChannels.assets.saveToCurrentProcedure.response, (_, fileNames: string[]) => inputAssetFilename.value = fileNames.toString());
      window.visualCal.electron.ipc.once(window.visualCal.ipcChannels.assets.saveToCurrentProcedure.error, (_, error: Error) => { alert(`An error occured saving the files:  ${error.message}`); });
      window.visualCal.electron.ipc.send(window.visualCal.ipcChannels.assets.saveToCurrentProcedure.request, files);
    });

    assetsEditableList.editableList<Asset>({
      addButton: true,
      addItem: (row, _, data) => {
        const jqueryRow = $(row);
        jqueryRow.html(data.name);
      }
    });
  }
};

RED.nodes.registerType('indysoft-user-input', IndySoftUserInputNodeDef);