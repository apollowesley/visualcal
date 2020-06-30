import { ipcRenderer } from 'electron';

const titleElement: HTMLHeadingElement = document.getElementById('vc-instruction-title') as HTMLHeadingElement;
const instructionElement: HTMLParagraphElement = document.getElementById('vc-instruction-text') as HTMLParagraphElement;
const okButton: HTMLButtonElement = document.getElementById('vc-instruction-ok-button') as HTMLButtonElement;
const cancelButton: HTMLButtonElement = document.getElementById('vc-instruction-cancel-button') as HTMLButtonElement;

let initialRequest: InstructionRequest;

okButton.addEventListener('click', () => {
  const response: InstructionResponse = {
    action: initialRequest.action,
    nodeId: initialRequest.nodeId,
    section: initialRequest.section,
    cancel: false,
    result: true
  }
  ipcRenderer.send('user-instruction-result', response);
  close();
});

cancelButton.addEventListener('click', () => {
  const response: InstructionResponse = {
    action: initialRequest.action,
    nodeId: initialRequest.nodeId,
    section: initialRequest.section,
    cancel: true,
    result: false
  }
  ipcRenderer.send('user-instruction-result', response);
  close();
});

const init = () => {
  ipcRenderer.on('user-instruction-request', (_, request: InstructionRequest) => {
    titleElement.innerText = request.title ? request.title : 'Missing title';
    instructionElement.innerText = request.text ? request.text : 'Missing text';
    initialRequest = request;
  });
}

init();
