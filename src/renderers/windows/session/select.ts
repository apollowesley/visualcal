import { ipcRenderer } from 'electron';
import Tabulator from 'tabulator-tables';
import { IpcChannels } from '../../../constants';

let procedureName = '';

const cancelButton = document.getElementById('vc-cancel-button') as HTMLButtonElement;
const createButton = document.getElementById('vc-create-button') as HTMLButtonElement;
const heading = document.getElementById('vc-heading') as HTMLHeadingElement;

const selectButtonClicked = (cell: Tabulator.CellComponent) => {
  const row = cell.getRow();
  const nameCell = row.getCell('name');
  const sessionName: string = nameCell.getValue();
  window.visualCal.sessionManager.setActive(sessionName);
  // DO NOT CLOSE WINDOW FROM HERE
};

const selectButtonTableCellFormatter = (cell: Tabulator.CellComponent) => {
  const btn = document.createElement('button');
  btn.innerText = 'Select';
  btn.addEventListener('click', () => selectButtonClicked(cell));
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
  ipcRenderer.send(IpcChannels.sessions.cancelSelect);
};

createButton.onclick = (ev) => {
  ev.preventDefault();
  ipcRenderer.send(IpcChannels.windows.showCreateSession, procedureName);
}

ipcRenderer.on(IpcChannels.sessions.selectData, (_, arg: { procedureName: string, sessions: Session[] }) => {
  procedureName = arg.procedureName;
  heading.innerText = `Select session for procedure "${procedureName}"`;
  existingSessionsTable.setData(arg.sessions);
});
