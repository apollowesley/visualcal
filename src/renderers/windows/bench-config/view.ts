import { ipcRenderer } from 'electron';
import { BenchConfig } from '../../../@types/bench-configuration';
import { IpcChannels } from '../../../constants';

const createInterfaceButton = document.getElementById('vc-create-button') as HTMLBRElement;
const closeButton = document.getElementById('vc-close-button') as HTMLButtonElement;

closeButton.addEventListener('click', (ev) => {
  ev.preventDefault();
  close();
});

createInterfaceButton.addEventListener('click', () => {
  window.visualCal.electron.showCreateCommIfaceWindow();
});

ipcRenderer.on(IpcChannels.benchConfig.getAllForSession.request, () => {

});

ipcRenderer.on(IpcChannels.user.benchConfig.getAllForCurrentUser.response, (_, configs: BenchConfig[]) => {

});

window.addEventListener('initial-load-data-received', (e) => {
  const ce = e as CustomEvent;
  const data = ce.detail as VisualCalWindowInitialLoadData;
  console.info(data.user);
});
