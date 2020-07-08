import { IpcChannels } from '../../../@types/constants';
import { ErrorResponseArgs, GetAllResponseArgs } from '../../managers/RendererCRUDManager';

let nameField: HTMLInputElement;
let procedureSelect: HTMLSelectElement;
let createButton: HTMLButtonElement;
let cancelButton: HTMLButtonElement;

const checkElementsExist = () => {
  if (!nameField) throw new Error('Missing required element');
  if (!procedureSelect) throw new Error('Missing required element');
  if (!createButton) throw new Error('Missing required element');
  if (!cancelButton) throw new Error('Missing required element');
}

const updateCreateButton = () => {
  createButton.disabled = nameField.value === '' || procedureSelect.value === '';
}

const init = () => {
  nameField = document.getElementById('vc-session-name') as HTMLInputElement;
  procedureSelect = document.getElementById('vc-session-procedure') as HTMLSelectElement;
  createButton = document.getElementById('vc-session-create-button') as HTMLButtonElement;
  cancelButton = document.getElementById('vc-session-cancel-button') as HTMLButtonElement;

  checkElementsExist();

  nameField.addEventListener('change', () => {
    updateCreateButton();
  });

  procedureSelect.addEventListener('change', () => {
    updateCreateButton();
  });

  window.visualCal.procedureManager.on(IpcChannels.procedures.getAll.response, async (response: GetAllResponseArgs<Procedure>) => {
    console.info('GetAll', response.items);
    for (let optionIndex = 0; optionIndex < procedureSelect.options.length; optionIndex++) {
      procedureSelect.options.remove(optionIndex);
    }
    response.items.forEach(p => {
      const pOptionElement = document.createElement('option');
      pOptionElement.value = p.name;
      pOptionElement.label = p.name;
      procedureSelect.options.add(pOptionElement);
    });
  });

  window.visualCal.sessionManager.on(IpcChannels.sessions.create.error, (response: ErrorResponseArgs) => {
    alert(response.error.message);
    updateCreateButton();
  });

  window.visualCal.sessionManager.on(IpcChannels.sessions.create.response, () => {
    alert('Session created!');
    window.close();
  });

  createButton.addEventListener('click', async () => {
    createButton.disabled = true;
    const name = nameField.value;
    const selectedProc = procedureSelect.value;
    try {
      if (!window.visualCal.user) throw new Error('User must be logged in');
      window.visualCal.sessionManager.create({
        name: name,
        procedureName: selectedProc,
        username: window.visualCal.user.email,
        configuration: {
          devices: [],
          interfaces: []
        }
      });
    } catch (error) {
      alert(error.message);
    }
  });

  cancelButton.addEventListener('click', () => {
    window.close();
  });

  window.visualCal.procedureManager.getAll();
}

init();
