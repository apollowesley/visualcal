import { IpcChannels } from '../../@types/constants';
import { GetAllResponseArgs, RenameResponseArgs, CreateResponseArgs, RemoveResponseArgs, UpdateResponseArgs, SetActiveResponseArgs } from '../managers/RendererCRUDManager';
import { ipcRenderer } from 'electron';
import moment from 'moment';
import Tabulator from 'tabulator-tables';
import { ProcedureManager } from '../managers/ProcedureManager';

// ***** PROCEDURES *****

const procManager = new ProcedureManager(window.visualCal.dirs.userHomeData.procedures);
let activeProcedureHeading: HTMLHeadingElement;
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
  window.visualCal.procedureManager.on(IpcChannels.procedures.setActive.response, async (response: SetActiveResponseArgs) => {
    console.info('Update', response.name);
    activeProcedureHeading.innerText = response.name;
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
      alert(`Procedure, ${newName}, renamed`);
    }
  });
  window.visualCal.procedureManager.getExists(newName);
}

const procedureDescriptionCellEdited = (cell: Tabulator.CellComponent) => {
  const newDesc = cell.getValue() as string;
  const procName = cell.getRow().getCell('name').getValue() as string;
  const proc = procedures.find(p => p.name === procName);
  if (!proc) throw new Error('Procedure not found!');
  ipcRenderer.once(IpcChannels.procedures.update.response, (_, procedure: Procedure) => {
    alert(`Procedure, ${procedure.name}, updated`);
  });
  proc.description = newDesc;
  window.visualCal.procedureManager.update(proc);
}

const proceduresTable = new Tabulator('#vc-procedures-tabulator', {
  data: procedures,
  layout: 'fitColumns',
  columns: [
    { title: 'Name', field: 'name', validator: ['required', 'string', 'unique'], editable: true, editor: 'input', cellEdited: procedureNameCellEdited },
    { title: 'Description', field: 'description', editable: true, editor: 'textarea', cellEdited: procedureDescriptionCellEdited }
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
    procedures = await procManager.getAll();
    proceduresTable.setData(procedures);
    console.info(procedures);
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
      alert(`Session, ${newName}, renamed`);
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
  session.procedureName = newProcedureName;
  window.visualCal.sessionManager.update(session);
}

const activateSessionIcon = (cell: Tabulator.CellComponent, formatterParams: Tabulator.FormatterParams, onRendered: any) => {
  return '<button>Activate</button>';
}

const viewSessionIcon = (cell: Tabulator.CellComponent, formatterParams: Tabulator.FormatterParams, onRendered: any) => {
  return '<button>View</button>';
}

const activateSessionClick = async (cell: Tabulator.CellComponent) => {
  const sessionName = cell.getRow().getCell('name').getValue() as string;
  window.visualCal.sessionManager.setActive(sessionName);
}

const viewSessionClick = async (cell: Tabulator.CellComponent) => {
  const sessionName = cell.getRow().getCell('name').getValue() as string;
  window.visualCal.electron.showViewSessionWindow(sessionName);
}

const sessionsTable = new Tabulator('#vc-sessions-tabulator', {
  data: sessions,
  layout: 'fitColumns',
  columns: [
    { title: 'Name', field: 'name', validator: ['required', 'string', 'unique'], editable: true, editor: 'input', cellEdited: sessionNameCellEdited },
    { title: 'Procedure', field: 'procedureName', editable: true, editor: 'select', editorParams: () => procedures.map(p => p.name), cellEdited: sessionProcedureCellEdited },
    { title: 'Username', field: 'username', editable: false, minWidth: 120 },
    { title: 'Activate', formatter: activateSessionIcon, width: 80, hozAlign: 'center', vertAlign: 'middle', cellClick: (_, cell) => activateSessionClick(cell) },
    { title: 'Activate', formatter: viewSessionIcon, width: 80, hozAlign: 'center', vertAlign: 'middle', cellClick: (_, cell) => viewSessionClick(cell) }
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

  activeProcedureHeading = document.getElementById('vc-procedure-active-heading') as HTMLHeadingElement;

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

  window.visualCal.procedureManager.getActive();
}

init();
