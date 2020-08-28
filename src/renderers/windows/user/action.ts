import { ipcRenderer } from 'electron';
import { IpcChannels } from '../../../constants';

const titleElement = document.getElementById('vc-title') as HTMLHeadingElement;

const instructionElement = document.getElementById('vc-instruction') as HTMLParagraphElement;

const imageRowElement = document.getElementById('vc-input-row') as HTMLDivElement;
const imageElement = document.getElementById('vc-image') as HTMLImageElement;

const inputRowElement = document.getElementById('vc-input-row') as HTMLDivElement;
const inputPrefixLabel = document.getElementById('vc-input-prefix-text') as HTMLLabelElement;
const inputElement = document.getElementById('vc-input') as HTMLInputElement;
const inputAppendLabel = document.getElementById('vc-input-append-text')  as HTMLLabelElement;

const okButton = document.getElementById('vc-btn-ok') as HTMLButtonElement;
const cancelButton = document.getElementById('vc-btn-cancel') as HTMLButtonElement;

ipcRenderer.on(IpcChannels.user.input.request, (_, request: UserInputRequest) => {
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
  inputPrefixLabel.innerText = `${inputPrefixLabel.innerText} (Data type: ${request.dataType})`;
  if (request.append) {
    inputAppendLabel.innerText = request.append;
    inputAppendLabel.classList.remove('collapse');
  } else {
    inputAppendLabel.classList.add('collapse');
  }
  initialInputRequest = request;
});

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
  ipcRenderer.send(IpcChannels.user.input.result, response);
}

okButton.addEventListener('click', () => {
  if (initialInputRequest) {
    handleInputOkResponse();
  } else {
    alert('Initial input request is not defined');
  }
  close();
});

function handleInputCancelResponse() {
  const response: UserInputResponse = {
    action: initialInputRequest.action,
    nodeId: initialInputRequest.nodeId,
    section: initialInputRequest.section,
    cancel: true,
    result: false
  };
  ipcRenderer.send(IpcChannels.user.input.result, response);
}

cancelButton.addEventListener('click', () => {
  if (initialInputRequest) handleInputCancelResponse();
  close();
});

function handleImage(request: UserInputRequest) {
  if (request.showImage && request.fileBase64Contents) {
    imageElement.src = request.fileBase64Contents;
    imageRowElement.classList.remove('collapse');
  } else {
    imageRowElement.classList.add('collapse');
  }
}
