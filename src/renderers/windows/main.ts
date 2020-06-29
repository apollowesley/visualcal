import { IpcChannels } from '../../@types/constants';
import { GetAllResponseArgs, RenameResponseArgs, CreateResponseArgs, RemoveResponseArgs } from '../managers/RendererCRUDManager';
import { ipcRenderer } from 'electron';
import moment from 'moment';
import Tabulator from 'tabulator-tables';

let createProcedureButton: HTMLButtonElement;
let procedures: Procedure[] = [];

let createSessionButton: HTMLButtonElement;
let sessions: Session[] = [];

const procedureNameCellEdited = (cell: Tabulator.CellComponent) => {
  const oldName = cell.getOldValue() as string;
  const newName = cell.getValue() as string;
  ipcRenderer.once(IpcChannels.procedures.getExists.response, (_, exists: boolean) => {
    if (exists) {
      cell.restoreOldValue();
      alert(`Procedure name must be unique`);
    } else {
      window.visualCal.procedureManager.rename(oldName, newName);
    }
  });
  window.visualCal.procedureManager.getExists(newName);
}

const proceduresTable = new Tabulator('#vc-procedures-tabulator', {
  data: procedures,
  layout: 'fitColumns',
  columns: [
    { title: 'Name', field: 'name', validator: ['required', 'string', 'unique'], editable: true, editor: 'input', cellEdited: procedureNameCellEdited },
    { title: 'Description', field: 'description', editable: true, editor: 'textarea' }
  ]
});

const areProcedureListsDifferent = (newProcedures: Procedure[]) => {
  const diff: Procedure[] = [];
  newProcedures.forEach(newProc => {
    const existing = procedures.find(p => p.name === newProc.name);
    if (!existing) diff.push(newProc);
  });
  return diff.length > 0;
}

const loadProcedures = async () => {
  console.info('Loading procedures');
  try {
    window.visualCal.procedureManager.getAll();
  } catch (error) {
    alert(error.message);
    throw error;
  }
}

const refreshProcedures = async (newProcedures: Procedure[]) => {
  try {
    console.info('Got procedures', newProcedures);
    const areProcListsDifferent = areProcedureListsDifferent(newProcedures);
    if (!areProcListsDifferent) {
      console.info('Procedure lists are not different, aborting update');
      return;
    }
    procedures = newProcedures;
    proceduresTable.setData(procedures);
  } catch (error) {
    alert(error.message);
    throw error;
  }
}

const init = async () => {
  window.visualCal.procedureManager.on(IpcChannels.procedures.create.response, async (response: CreateResponseArgs<CreatedProcedureInfo>) => {
    console.info('Created', response.item);
    await loadProcedures();
  });
  window.visualCal.procedureManager.on(IpcChannels.procedures.rename.response, async (response: RenameResponseArgs) => {
    console.info('Renamed', response.oldName, response.newName);
    await loadProcedures();
  });
  window.visualCal.procedureManager.on(IpcChannels.procedures.remove.response, async (response: RemoveResponseArgs) => {
    console.info('Removed', response.name);
    await loadProcedures();
  });
  window.visualCal.procedureManager.on(IpcChannels.procedures.getAll.response, async (response: GetAllResponseArgs<Procedure>) => {
    console.info('GetAll', response.items);
    await refreshProcedures(response.items);
  });

  createProcedureButton = document.getElementById('vc-card-procedures-create-button') as HTMLButtonElement;
  createProcedureButton.addEventListener('click', async () => {
    await window.visualCal.electron.showWindow(VisualCalWindow.CreateProcedure);
  });

  createSessionButton = document.getElementById('vc-card-sessions-create-button') as HTMLButtonElement;
  createSessionButton.addEventListener('click', async () => {
    await window.visualCal.electron.showWindow(VisualCalWindow.CreateSession);
  });

  await loadProcedures();
}

init();
