import { ipcRenderer } from 'electron';
import { IpcChannels } from '../../../../constants';

const sendButton = document.getElementById('vc-send-button') as HTMLButtonElement;
const cancelButton = document.getElementById('vc-cancel-button') as HTMLButtonElement;
const commandLabel = document.getElementById('vc-command-label') as HTMLLabelElement;
const commandInput = document.getElementById('vc-command') as HTMLInputElement;

sendButton.addEventListener('click', (ev) => {
  ev.preventDefault();
  ipcRenderer.send(IpcChannels.interceptWrite.response, { data: commandInput.value });
});

cancelButton.addEventListener('click', (ev) => {
  ev.preventDefault();
  ipcRenderer.send(IpcChannels.interceptWrite.cancel, { data: commandInput.value, cancel: true });
});

ipcRenderer.on(IpcChannels.interceptWrite.request, (_, args: { deviceName: string, ifaceName: string, data: string }) => {
  commandLabel.textContent = `About to send the following command to device "${args.deviceName}" over interface "${args.ifaceName}".  Please make any changes and click send or cancel.`;
  commandInput.value = args.data;
});
