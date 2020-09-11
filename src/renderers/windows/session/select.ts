import { ipcRenderer } from 'electron';
import Tabulator from 'tabulator-tables';
import { IpcChannels } from '../../../constants';

let activeProcedureName = '';

const cancelButton = document.getElementById('vc-cancel-button') as HTMLButtonElement;
const createButton = document.getElementById('vc-create-button') as HTMLButtonElement;
const heading = document.getElementById('vc-heading') as HTMLHeadingElement;

const selectButtonClicked = (cell: Tabulator.CellComponent) => {
  const row = cell.getRow();
  const nameCell = row.getCell('name');
  const sessionName: string = nameCell.getValue();
  ipcRenderer.send(IpcChannels.session.setActive.request, sessionName);
  // DO NOT CLOSE WINDOW FROM HERE
};

const selectButtonTableCellFormatter = (cell: Tabulator.CellComponent) => {
  const btn = document.createElement('button');
  btn.innerText = 'Select';
  btn.addEventListener('click', (ev) => {
    ev.preventDefault();
    btn.disabled = true;
    selectButtonClicked(cell)
  });
  return btn;
};

const existingSessionsTable = new Tabulator('#vc-tabulator', {
  data: [],
  layout: 'fitColumns',
  columns: [
    { title: 'Name', field: 'name', validator: ['required', 'string', 'unique'] },
    { title: 'Description', field: 'description' },
    { title: '', formatter: selectButtonTableCellFormatter, width: 80, hozAlign: 'center', vertAlign: 'middle' }
  ]
});

cancelButton.onclick = (ev) => {
  ev.preventDefault();
  ipcRenderer.send(IpcChannels.session.cancelSelect);
};

createButton.onclick = (ev) => {
  ev.preventDefault();
  ipcRenderer.send(IpcChannels.windows.showCreateSession, activeProcedureName);
}

ipcRenderer.on(IpcChannels.session.getAllForActiveUser.response, (_, sessions: Session[]) => {
  existingSessionsTable.setData(sessions.filter(s => s.procedureName === activeProcedureName));
});

ipcRenderer.on(IpcChannels.procedures.getActive.response, (_, procedureName: string) => {
  activeProcedureName = procedureName;
  heading.innerText = `Select session for procedure "${procedureName}"`;
  ipcRenderer.send(IpcChannels.session.getAllForActiveUser.request);
});

ipcRenderer.send(IpcChannels.procedures.getActive.request);
