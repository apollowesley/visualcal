import { ipcRenderer } from 'electron';
import Tabulator from 'tabulator-tables';
import { IpcChannels } from '../../../../constants';

const getActiveUser = () => {
  if (!window.visualCal.initialLoadData || !window.visualCal.initialLoadData.user) return undefined;
  return window.visualCal.initialLoadData.user;
}

const getActiveSession = () => {
  if (!window.visualCal.initialLoadData || !window.visualCal.initialLoadData.session) return undefined;
  return window.visualCal.initialLoadData.session;
}

const deleteCommInterface = (name: string) => {
  const user = getActiveUser();
  if (!user) {
    window.visualCal.electron.showErrorDialog(new Error('Expected an active user, but it was undefined.  This is a bug.'));
    return;
  }
  ipcRenderer.send(IpcChannels.user.benchConfig.removeCommInterface.request, { name: name, userEmail: user.email, benchConfigName: user.benchConfigs[0].name });
}

const createDeleteCommInterfaceButton = (cell: Tabulator.CellComponent) => {
  const button = document.createElement('button');
  const commInterface = cell.getRow().getData() as CommunicationInterfaceConfigurationInfo;
  button.innerHTML = 'Delete';
  button.addEventListener('click', () => deleteCommInterface(commInterface.name));
  return button;
}

const createInterfaceButton = document.getElementById('vc-create-button') as HTMLBRElement;
const closeButton = document.getElementById('vc-close-button') as HTMLButtonElement;
const commInterfacesTable = new Tabulator('#vc-session-comm-ifaces-tabulator', {
  data: [],
  layout: 'fitData',
  columns: [
    { title: 'Name', field: 'name' },
    { title: 'Type', field: 'type' },
    { title: 'TCP Host', field: 'tcp.host' },
    { title: 'TCP Port', field: 'tcp.port' },
    { title: 'Serial Port Name', field: 'serial.port' },
    { title: 'Serial Port Baud', field: 'serial.baudRate' },
    { title: 'GPIB Address', field: 'gpib.address' },
    { title: 'NI-GPIB Unit Id', field: 'nationalInstrumentsGpib.unitId' },
    { title: '', formatter: createDeleteCommInterfaceButton }
  ]
});

closeButton.addEventListener('click', (ev) => {
  ev.preventDefault();
  close();
});

createInterfaceButton.addEventListener('click', () => {
  window.visualCal.electron.showCreateCommIfaceWindow();
});

window.addEventListener('initial-load-data-received', (e) => {
  const ce = e as CustomEvent;
  const data = ce.detail as VisualCalWindowInitialLoadData | undefined;
  if (!data || !data.user) {
    window.visualCal.electron.showErrorDialog(new Error('Expected initial window load data, but it was undefined'));
    return;
  }
  commInterfacesTable.setData(data.user.benchConfigs[0].interfaces);
});

ipcRenderer.on(IpcChannels.user.benchConfig.removeCommInterface.response, (_, name: string) => {
  // if (!window.visualCal.initialLoadData || !window.visualCal.initialLoadData.user) return;
  // const config = window.visualCal.initialLoadData.user.benchConfigs;
  // if (!config) return;
  // const interfaceIndex = config.interfaces.findIndex(i => i.name === name);
  // config.interfaces.splice(interfaceIndex, 1);
  // commInterfacesTable.setData(config.interfaces);
});

ipcRenderer.on(IpcChannels.user.benchConfig.removeCommInterface.error, (_, error: Error) => {
  window.visualCal.electron.showErrorDialog(error);
});
