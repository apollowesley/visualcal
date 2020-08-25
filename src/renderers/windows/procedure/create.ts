import { ipcRenderer } from 'electron';
import { IpcChannels } from '../../../constants';
import { ErrorResponseArgs } from '../../managers/RendererCRUDManager';

const nameField = document.getElementById('vc-name') as HTMLInputElement;
const descriptionField = document.getElementById('vc-description') as HTMLTextAreaElement;
let createButton = document.getElementById('vc-create-button') as HTMLButtonElement;
let cancelButton = document.getElementById('vc-cancel-button') as HTMLButtonElement;

const updateCreateButton = () => {
  createButton.disabled = nameField.value.length < 1 || descriptionField.value.length < 1 ;
}

nameField.addEventListener('blur', updateCreateButton);
nameField.addEventListener('change', updateCreateButton);
descriptionField.addEventListener('change', updateCreateButton);

ipcRenderer.on(IpcChannels.procedures.create.error, (_, response: ErrorResponseArgs) => {
  alert(response.error.message);
  updateCreateButton();
});

ipcRenderer.on(IpcChannels.procedures.create.response, (_, procedure: { name: string }) => {
  console.info(procedure);
  ipcRenderer.send(IpcChannels.procedures.setActive.request, procedure.name);
});

createButton.addEventListener('click', async () => {
  createButton.disabled = true;
  const procName = nameField.value;
  const procDescription = descriptionField.value;
  try {
    window.visualCal.procedureManager.create({
      name: procName,
      description: procDescription
    });
  } catch (error) {
    alert(error.message);
  }
});

cancelButton.addEventListener('click', () => {
  ipcRenderer.send(IpcChannels.procedures.cancelCreate);
});
