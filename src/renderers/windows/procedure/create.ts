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

  createButton.addEventListener('click', async () => {
    checkElementsExist();
    const procName = nameField.value;
    const procDescription = descriptionField.value;
    try {
      await global.visualCal.procedureManager.create({
        name: procName,
        description: procDescription
      });
      alert('Procedure created!');
      window.close();
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
