import { IpcChannels } from '../../../constants';
import { ErrorResponseArgs } from '../../managers/RendererCRUDManager';

let nameField: HTMLInputElement;
let descriptionField: HTMLTextAreaElement;
let createButton: HTMLButtonElement;
let cancelButton: HTMLButtonElement;

const checkElementsExist = () => {
  if (!nameField) throw new Error('Missing required element');
  if (!descriptionField) throw new Error('Missing required element');
  if (!createButton) throw new Error('Missing required element');
  if (!cancelButton) throw new Error('Missing required element');
}

const updateCreateButton = () => {
  createButton.disabled = nameField.value === '' || descriptionField.value === '';
}

const init = () => {
  nameField = document.getElementById('vc-procedure-name') as HTMLInputElement;
  descriptionField = document.getElementById('vc-procedure-description') as HTMLTextAreaElement;
  createButton = document.getElementById('vc-procedure-create-button') as HTMLButtonElement;
  cancelButton = document.getElementById('vc-procedure-cancel-button') as HTMLButtonElement;

  checkElementsExist();

  nameField.addEventListener('change', () => {
    updateCreateButton();
  });

  descriptionField.addEventListener('change', () => {
    updateCreateButton();
  });

  window.visualCal.procedureManager.on(IpcChannels.procedures.create.error, (response: ErrorResponseArgs) => {
    alert(response.error.message);
    updateCreateButton();
  });

  window.visualCal.procedureManager.on(IpcChannels.procedures.create.response, () => {
    alert('Procedure created!');
    window.close();
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
    window.close();
  });
}

init();
