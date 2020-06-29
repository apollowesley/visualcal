import { IpcChannels } from '../../@types/constants';
import { GetAllResponseArgs, RenameResponseArgs } from '../managers/RendererProcedureManager';
import { ipcRenderer } from 'electron';
import moment from 'moment';
import Tabulator from 'tabulator-tables';

let createProcedureButton: HTMLButtonElement;
let procedures: Procedure[] = [];

const nameCellEdited = (cell: Tabulator.CellComponent) => {
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

const table = new Tabulator('#vc-procedures-tabulator', {
  data: procedures,
  layout: 'fitColumns',
  columns: [
    { title: 'Name', field: 'name', validator: ['required', 'string', 'unique'], editable: true, editor: 'input', cellEdited: nameCellEdited },
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
    table.setData(procedures);
  } catch (error) {
    alert(error.message);
    throw error;
  }
}

const init = async () => {
  ipcRenderer.on(IpcChannels.procedures.create.response, async (_, procedure: CreateProcedureInfo) => {
    console.info('Created', procedure);
    await loadProcedures();
  });
  window.visualCal.procedureManager.on(IpcChannels.procedures.rename.response, async (response: RenameResponseArgs) => {
    console.info('Renamed', response.oldName, response.newName);
    await loadProcedures();
  });
  ipcRenderer.on(IpcChannels.procedures.remove.response, async (_, name: string) => {
    console.info('Removed', name);
    await loadProcedures();
  });
  window.visualCal.procedureManager.on(IpcChannels.procedures.getAll.response, async (response: GetAllResponseArgs) => {
    console.info('GetAll', response.procedures);
    await refreshProcedures(response.procedures);
  });

  createProcedureButton = document.getElementById('vc-card-procedures-create-button') as HTMLButtonElement;
  createProcedureButton.addEventListener('click', async () => {
    await window.visualCal.electron.showWindow(VisualCalWindow.CreateProcedure);
  });

  await loadProcedures();
}

init();
