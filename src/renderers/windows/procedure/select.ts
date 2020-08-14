import Tabulator from 'tabulator-tables';
import { IpcChannels } from '../../../constants';
import { GetAllResponseArgs } from '../../managers/RendererCRUDManager';

const cancelButton = document.getElementById('vc-cancel-button') as HTMLButtonElement;

let procedures: ProcedureInfo[] = [];

const selectProcedureButtonClicked = (cell: Tabulator.CellComponent) => {
  const row = cell.getRow();
  const nameCell = row.getCell('name');
  const procedureName: string = nameCell.getValue();
  window.visualCal.procedureManager.setActive(procedureName);
  // DO NOT CLOSE WINDOW FROM HERE
}

const selectProcedureButtonTableCellFormatter = () => {
  return '<button>Select</button>';
}

const existingProceduresTable = new Tabulator('#vc-procedures-tabulator', {
  data: procedures,
  layout: 'fitColumns',
  columns: [
    { title: 'Name', field: 'name', validator: ['required', 'string', 'unique'] },
    { title: 'Description', field: 'description' },
    { title: '', formatter: selectProcedureButtonTableCellFormatter, width: 80, hozAlign: 'center', vertAlign: 'middle', cellClick: (_, cell) => selectProcedureButtonClicked(cell) }
  ]
});

cancelButton.onclick = (ev) => {
  ev.preventDefault();
  window.visualCal.electron.quit();
}

window.visualCal.procedureManager.on(IpcChannels.procedures.getAll.response, (args: GetAllResponseArgs<ProcedureInfo>) => {
  procedures = args.items;
  existingProceduresTable.setData(procedures);
});

window.visualCal.procedureManager.on(IpcChannels.procedures.getAll.error, (_, error: Error) => {
  window.visualCal.electron.showErrorDialog(error);
});

window.visualCal.procedureManager.getAll();
