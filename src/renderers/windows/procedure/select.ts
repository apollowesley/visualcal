import { ipcRenderer } from 'electron';
import Tabulator from 'tabulator-tables';
import { IpcChannels } from '../../../constants';

const cancelButton = document.getElementById('vc-cancel-button') as HTMLButtonElement;
const createButton = document.getElementById('vc-create-button') as HTMLButtonElement;

const selectButtonClicked = (cell: Tabulator.CellComponent) => {
  const row = cell.getRow();
  const nameCell = row.getCell('name');
  const procedureName: string = nameCell.getValue();
  window.visualCal.procedureManager.setActive(procedureName);
  // DO NOT CLOSE WINDOW FROM HERE
};

const selectButtonTableCellFormatter = (cell: Tabulator.CellComponent) => {
  const btn = document.createElement('button');
  btn.innerText = 'Select';
  btn.addEventListener('click', () => selectButtonClicked(cell));
  return btn;
};

const existingProceduresTable = new Tabulator('#vc-tabulator', {
  data: [],
  layout: 'fitColumns',
  columns: [
    { title: 'Name', field: 'name', validator: ['required', 'string', 'unique'] },
    { title: 'Description', field: 'description' },
    { title: 'Version', field: 'version' },
    { title: 'Created By', field: 'authorOrganization' },
    { title: '', formatter: selectButtonTableCellFormatter, width: 80, hozAlign: 'center', vertAlign: 'middle' }
  ]
});

cancelButton.onclick = (ev) => {
  ev.preventDefault();
  ipcRenderer.send(IpcChannels.procedures.cancelSelect);
};

createButton.onclick = (ev) => {
  ev.preventDefault();
  ipcRenderer.send(IpcChannels.windows.showCreateProcedure);
}

ipcRenderer.on(IpcChannels.procedures.selectData, (_, items: ProcedureInfo[]) => {
  existingProceduresTable.setData(items);
});
