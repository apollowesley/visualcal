import { IpcChannels } from '../../@types/constants';
import { GetAllResponseArgs, RenameResponseArgs, CreateResponseArgs, RemoveResponseArgs, UpdateResponseArgs } from '../managers/RendererCRUDManager';
import { ipcRenderer } from 'electron';
import moment from 'moment';
import Tabulator from 'tabulator-tables';

// ***** PROCEDURES *****

let createProcedureButton: HTMLButtonElement;
let procedures: Procedure[] = [];

const initProcedureListeners = () => {
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
  window.visualCal.procedureManager.on(IpcChannels.procedures.update.response, async (response: UpdateResponseArgs<Procedure>) => {
    console.info('Update', response.item);
    await loadProcedures();
  });
}

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
    const areListsDifferent = areProcedureListsDifferent(newProcedures);
    if (!areListsDifferent) {
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

// ***** SESSIONS *****

let createSessionButton: HTMLButtonElement;
let sessions: Session[] = [];

const initSessionListeners = () => {
  window.visualCal.sessionManager.on(IpcChannels.sessions.create.response, async (response: CreateResponseArgs<Session>) => {
    console.info('Created', response.item);
    await loadSessions();
  });
  window.visualCal.sessionManager.on(IpcChannels.sessions.rename.response, async (response: RenameResponseArgs) => {
    console.info('Renamed', response.oldName, response.newName);
    await loadSessions();
  });
  window.visualCal.sessionManager.on(IpcChannels.sessions.remove.response, async (response: RemoveResponseArgs) => {
    console.info('Removed', response.name);
    await loadSessions();
  });
  window.visualCal.sessionManager.on(IpcChannels.sessions.getAll.response, async (response: GetAllResponseArgs<Session>) => {
    console.info('GetAll', response.items);
    await refreshSessions(response.items);
  });
  window.visualCal.sessionManager.on(IpcChannels.sessions.update.response, async (response: UpdateResponseArgs<Session>) => {
    console.info('Update', response.item);
    await loadSessions();
  });
}

const sessionNameCellEdited = (cell: Tabulator.CellComponent) => {
  const oldName = cell.getOldValue() as string;
  const newName = cell.getValue() as string;
  ipcRenderer.once(IpcChannels.sessions.getExists.response, (_, exists: boolean) => {
    if (exists) {
      cell.restoreOldValue();
      alert(`Session name must be unique`);
    } else {
      window.visualCal.sessionManager.rename(oldName, newName);
    }
  });
  window.visualCal.sessionManager.getExists(newName);
}

const sessionProcedureCellEdited = (cell: Tabulator.CellComponent) => {
  const newProcedureName = cell.getValue() as string;
  const sessionName = cell.getRow().getCell('name').getValue() as string;
  const session = sessions.find(s => s.name === sessionName);
  if (!session) throw new Error('Session not found!');
  ipcRenderer.once(IpcChannels.sessions.update.response, (_, session: Session) => {
    alert(`Session, ${session.name}, updated`);
  });
  window.visualCal.sessionManager.update({
    name: sessionName,
    procedureName: newProcedureName,
    username: session.username,
    lastActionName: session.lastActionName,
    lastSectionName: session.lastSectionName
  });
}

const sessionsTable = new Tabulator('#vc-sessions-tabulator', {
  data: sessions,
  layout: 'fitColumns',
  columns: [
    { title: 'Name', field: 'name', validator: ['required', 'string', 'unique'], editable: true, editor: 'input', cellEdited: sessionNameCellEdited },
    { title: 'Procedure', field: 'procedureName', editable: true, editor: 'select', editorParams: () => procedures.map(p => p.name), cellEdited: sessionProcedureCellEdited },
    { title: 'Username', field: 'username', editable: false }
  ]
});

const areSessionListsDifferent = (newSessions: Session[]) => {
  const diff: Session[] = [];
  newSessions.forEach(newSession => {
    const existing = sessions.find(p => p.name === newSession.name);
    if (!existing) diff.push(newSession);
  });
  return diff.length > 0;
}

const loadSessions = async () => {
  console.info('Loading sessions');
  try {
    window.visualCal.sessionManager.getAll();
  } catch (error) {
    alert(error.message);
    throw error;
  }
}

const refreshSessions = async (newSessions: Session[]) => {
  try {
    console.info('Got sessions', newSessions);
    const areListsDifferent = areSessionListsDifferent(newSessions);
    if (!areListsDifferent) {
      console.info('Session lists are not different, aborting update');
      return;
    }
    sessions = newSessions;
    sessionsTable.setData(sessions);
  } catch (error) {
    alert(error.message);
    throw error;
  }
}

// ***** INIT *****

const init = async () => {
  initProcedureListeners();
  initSessionListeners();

  createProcedureButton = document.getElementById('vc-card-procedures-create-button') as HTMLButtonElement;
  createProcedureButton.addEventListener('click', () => {
    window.visualCal.electron.showWindow(VisualCalWindow.CreateProcedure);
  });

  createSessionButton = document.getElementById('vc-card-sessions-create-button') as HTMLButtonElement;
  createSessionButton.addEventListener('click', () => {
    window.visualCal.electron.showWindow(VisualCalWindow.CreateSession);
  });

  await loadProcedures();
  await loadSessions();
}

init();
