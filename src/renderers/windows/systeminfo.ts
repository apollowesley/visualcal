import {IpcService} from "./IpcService";

const ipc = new IpcService();
const requestInfoElement = document.getElementById('request-os-info');
const responseInfoElement = document.getElementById('os-info');

if (!requestInfoElement) throw new Error('Unable to locate request-os-info request element');
if (!responseInfoElement) throw new Error('Unable to locate os-info response element');

requestInfoElement.addEventListener('click', async () => {
  const t = await ipc.send<{ kernel: string }>('system-info');
  responseInfoElement.innerHTML = t.kernel;
});
