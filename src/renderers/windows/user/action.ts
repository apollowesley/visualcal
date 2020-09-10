import { ipcRenderer } from 'electron';
import { IpcChannels } from '../../../constants';

const titleElement = document.getElementById('vc-title') as HTMLHeadingElement;

const imageRowElement = document.getElementById('vc-image-row') as HTMLDivElement;
const instructionRowElement = document.getElementById('vc-instruction-row') as HTMLDivElement;
const inputRowElement = document.getElementById('vc-input-row') as HTMLDivElement;

const imageElement = document.getElementById('vc-image') as HTMLImageElement;
const instructionElement = document.getElementById('vc-instruction') as HTMLParagraphElement;

const inputPrefixLabel = document.getElementById('vc-input-prefix-text') as HTMLLabelElement;
const inputElement = document.getElementById('vc-input') as HTMLInputElement;
const inputAppendLabel = document.getElementById('vc-input-append-text')  as HTMLLabelElement;

const okButton = document.getElementById('vc-btn-ok') as HTMLButtonElement;
const cancelButton = document.getElementById('vc-btn-cancel') as HTMLButtonElement;

function handleImage(request: UserInputRequest) {
  if (request.showImage && request.fileBase64Contents) {
    imageElement.src = request.fileBase64Contents;
    imageRowElement.classList.remove('collapse');
  } else {
    imageRowElement.classList.add('collapse');
  }
}

function handleInstruction(request: UserInputRequest) {
  if (request.text) {
    instructionElement.textContent = request.text;
    instructionRowElement.classList.remove('collapse');
  } else {
    instructionRowElement.classList.add('collapse');
  }
}

let initialInputRequest: UserInputRequest;

okButton.addEventListener('click', () => {
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
  ipcRenderer.send(IpcChannels.user.input.result, response);
  close();
});

cancelButton.addEventListener('click', () => {
  const response: UserInputResponse = {
    action: initialInputRequest.action,
    nodeId: initialInputRequest.nodeId,
    section: initialInputRequest.section,
    cancel: true,
    result: false
  };
  ipcRenderer.send(IpcChannels.user.input.result, response);
  close();
});

const onUserInputRequest = (request: UserInputRequest) => {
  titleElement.innerText = request.title ? request.title : 'Missing title';
  handleInstruction(request);
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
  inputPrefixLabel.innerText = `${inputPrefixLabel.innerText} (Data type: ${request.dataType})`;
  if (request.append) {
    inputAppendLabel.innerText = request.append;
    inputAppendLabel.classList.remove('collapse');
  } else {
    inputAppendLabel.classList.add('collapse');
  }
  initialInputRequest = request;
}

ipcRenderer.on(IpcChannels.user.input.request, (_, request: UserInputRequest) => onUserInputRequest(request));
