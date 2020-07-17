import { ipcRenderer } from 'electron';

const titleElement = document.getElementById('vc-title') as HTMLHeadingElement;

const instructionElement = document.getElementById('vc-instruction') as HTMLParagraphElement;

const imageRowElement = document.getElementById('vc-input-row') as HTMLDivElement;
const imageElement = document.getElementById('vc-image') as HTMLImageElement;

const inputRowElement = document.getElementById('vc-input-row') as HTMLDivElement;
const inputElement = document.getElementById('vc-input') as HTMLInputElement;

const okButton = document.getElementById('vc-btn-ok') as HTMLButtonElement;
const cancelButton = document.getElementById('vc-btn-cancel') as HTMLButtonElement;

let initialInstructionRequest: InstructionRequest;
let initialInputRequest: UserInputRequest;

function handleInputOkResponse() {
  const response: UserInputResponse = {
    action: initialInputRequest.action,
    nodeId: initialInputRequest.nodeId,
    section: initialInputRequest.section,
    cancel: false
  };
  switch (initialInputRequest.dataType) {
    case 'boolean':
      response.result = !!inputElement.value;
      break;
    case 'float':
      response.result = parseFloat(inputElement.value);
      break;
    case 'integer':
      response.result = parseInt(inputElement.value);
      break;
    case 'string':
      response.result = inputElement.value;
      break;
  }
  ipcRenderer.send('user-input-result', response);
}

function handleInstructionOkResponse() {
  const response: InstructionResponse = {
    action: initialInstructionRequest.action,
    nodeId: initialInstructionRequest.nodeId,
    section: initialInstructionRequest.section,
    cancel: false,
    result: true
  };
  ipcRenderer.send('user-instruction-result', response);
}

okButton.addEventListener('click', () => {
  if (initialInputRequest) handleInputOkResponse();
  else if (initialInstructionRequest) handleInstructionOkResponse();
  close();
});

function handleInputCancelResponse() {
  const response: UserInputResponse = {
    action: initialInstructionRequest.action,
    nodeId: initialInstructionRequest.nodeId,
    section: initialInstructionRequest.section,
    cancel: true,
    result: false
  };
  ipcRenderer.send('user-instruction-result', response);
}

function handleInstructionCancelResponse() {
  const response: InstructionResponse = {
    action: initialInstructionRequest.action,
    nodeId: initialInstructionRequest.nodeId,
    section: initialInstructionRequest.section,
    cancel: true,
    result: false
  };
  ipcRenderer.send('user-input-result', response);
}

cancelButton.addEventListener('click', () => {
  if (initialInputRequest) handleInputCancelResponse();
  else if (initialInstructionRequest) handleInstructionCancelResponse();
  close();
});

function handleImage(options: { showImage: boolean, imageSource?: string, imageUrl?: string }) {
  if (options.showImage) {
    imageRowElement.classList.remove('collapse');
    if (options.imageSource) imageElement.src = options.imageSource;
    else if (options.imageUrl) imageElement.src = options.imageUrl;
  } else {
    imageRowElement.classList.add('collapse');
  }
}

const init = () => {

  // Instruction
  ipcRenderer.on('user-instruction-request', (_, request: InstructionRequest) => {
    titleElement.innerText = request.title ? request.title : 'Missing title';
    instructionElement.innerText = request.text ? request.text : 'Missing text';
    handleImage(request);
    inputRowElement.classList.add('collapse');
    initialInstructionRequest = request;
  });

  // Input
  ipcRenderer.on('user-input-request', (_, request: UserInputRequest) => {
    titleElement.innerText = request.title ? request.title : 'Missing title';
    instructionElement.innerText = request.text ? request.text : 'Missing text';
    handleImage(request);
    inputRowElement.classList.remove('collapse');
    switch (request.dataType) {
      case 'boolean':
        inputElement.type = 'checkbox';
        break;
      case 'float':
        inputElement.type = 'number';
        break;
      case 'integer':
        inputElement.type = 'number';
        break;
      case 'string':
        inputElement.type = 'text';
        break;
    }
    initialInputRequest = request;
  });
}

init();
