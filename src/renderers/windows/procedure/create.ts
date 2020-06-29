import { IpcChannels } from '../../../@types/constants';

let nameField: HTMLInputElement;
let descriptionField: HTMLTextAreaElement;
let createButton: HTMLButtonElement;
let cancelButton: HTMLButtonElement;

const checkElementsExist = () => {
  if (!nameField) throw new Error('Missing required element');
}

const updateCreateButton = () => {
  createButton.disabled = nameField.value === '' || descriptionField.value === '';
}

const init = () => {
  nameField = document.getElementById('vc-procedure-name') as HTMLInputElement;
  descriptionField = document.getElementById('vc-procedure-description') as HTMLTextAreaElement;
  createButton = document.getElementById('vc-procedure-create-button') as HTMLButtonElement;
  cancelButton = document.getElementById('vc-procedure-cancel-button') as HTMLButtonElement;

  nameField.addEventListener('blur', () => {
    updateCreateButton();
  });

  descriptionField.addEventListener('blur', () => {
    updateCreateButton();
  });

  window.visualCal.procedureManager.on(IpcChannels.procedures.create.error, (_, error: Error) => {
    alert(error.message);
  });

  window.visualCal.procedureManager.on(IpcChannels.procedures.create.response, () => {
    alert('Procedure created!');
    window.close();
  });

  createButton.addEventListener('click', async () => {
    checkElementsExist();
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

// document.addEventListener('load', () => init());
init();
