import { IpcChannels } from '../../@types/constants';
import { GetAllResponseArgs, RenameResponseArgs, CreateResponseArgs, RemoveResponseArgs, UpdateResponseArgs, SetActiveResponseArgs, GetAllCommunicationInterfacesResponse } from '../managers/RendererCRUDManager';
import { ipcRenderer } from 'electron';
import moment from 'moment';
import Tabulator from 'tabulator-tables';

// ***** PROCEDURES *****

let activeProcedureHeading: HTMLHeadingElement;
let createProcedureButton: HTMLButtonElement;
let procedures: Procedure[] = [];

const initProcedureListeners = () => {
  window.visualCal.procedureManager.on(IpcChannels.procedures.create.response, (response: CreateResponseArgs<CreatedProcedureInfo>) => {
    console.info('Created', response.item);
    loadProcedures();
  });
  window.visualCal.procedureManager.on(IpcChannels.procedures.rename.response, (response: RenameResponseArgs) => {
    console.info('Renamed', response.oldName, response.newName);
    loadProcedures();
  });
  window.visualCal.procedureManager.on(IpcChannels.procedures.remove.response, (response: RemoveResponseArgs) => {
    console.info('Removed', response.name);
    loadProcedures();
  });
  window.visualCal.procedureManager.on(IpcChannels.procedures.getAll.response, (response: GetAllResponseArgs<Procedure>) => {
    console.info('GetAll', response.items);
    refreshProcedures(response.items);
  });
  window.visualCal.procedureManager.on(IpcChannels.procedures.update.response, (response: UpdateResponseArgs<Procedure>) => {
    console.info('Update', response.item);
    loadProcedures();
  });
  window.visualCal.procedureManager.on(IpcChannels.procedures.setActive.response, (response: SetActiveResponseArgs) => {
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

const loadProcedures = () => {
  console.info('Loading procedures');
  try {
    window.visualCal.procedureManager.getAll();
  } catch (error) {
    alert(error.message);
    throw error;
  }
}

const refreshProcedures = (newProcedures: Procedure[]) => {
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
let selectedSession: Session | null = null;
let createSessionCommsIfaceButton: HTMLButtonElement;

const initSessionListeners = () => {
  window.visualCal.sessionManager.on(IpcChannels.sessions.create.response, (response: CreateResponseArgs<Session>) => {
    console.info('Created', response.item);
    loadSessions();
  });
  window.visualCal.sessionManager.on(IpcChannels.sessions.rename.response, (response: RenameResponseArgs) => {
    console.info('Renamed', response.oldName, response.newName);
    loadSessions();
  });
  window.visualCal.sessionManager.on(IpcChannels.sessions.remove.response, (response: RemoveResponseArgs) => {
    console.info('Removed', response.name);
    loadSessions();
  });
  window.visualCal.sessionManager.on(IpcChannels.sessions.getAll.response, (response: GetAllResponseArgs<Session>) => {
    console.info('GetAll', response.items);
    refreshSessions(response.items);
  });
  window.visualCal.sessionManager.on(IpcChannels.sessions.update.response, (response: UpdateResponseArgs<Session>) => {
    console.info('Update', response.item);
    loadSessions();
  });
  window.visualCal.sessionManager.on(IpcChannels.sessions.getCommunicationInterfaces.response, (response: GetAllCommunicationInterfacesResponse) => {
    console.info('GetAllCommunicationInterfacesResponse', response.iface);
    loadSessions();
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

const activateSessionClick = (cell: Tabulator.CellComponent) => {
  const sessionName = cell.getRow().getCell('name').getValue() as string;
  window.visualCal.sessionManager.setActive(sessionName);
}

const viewSessionClick = (cell: Tabulator.CellComponent) => {
  const sessionName = cell.getRow().getCell('name').getValue() as string;
  window.visualCal.electron.showViewSessionWindow(sessionName);
}

const refreshSessionCommIfaces = (selectedRow: Tabulator.RowComponent) => {
  selectedSession = selectedRow.getData() as Session;
  if (selectedSession.configuration) {
    sessionCommIfacesTable.setData(selectedSession.configuration.interfaces);
  } else {
    sessionCommIfacesTable.setData([]);
  }
}

const sessionsTable = new Tabulator('#vc-sessions-tabulator', {
  data: sessions,
  layout: 'fitColumns',
  rowClick: (_, row) => refreshSessionCommIfaces(row),
  columns: [
    { title: 'Name', field: 'name', validator: ['required', 'string', 'unique'], editable: true, editor: 'input', cellEdited: sessionNameCellEdited },
    { title: 'Procedure', field: 'procedureName', editable: true, editor: 'select', editorParams: () => procedures.map(p => p.name), cellEdited: sessionProcedureCellEdited },
    { title: 'Username', field: 'username', editable: false, minWidth: 120 },
    { title: 'Activate', formatter: activateSessionIcon, width: 80, hozAlign: 'center', vertAlign: 'middle', cellClick: (_, cell) => activateSessionClick(cell) },
    { title: 'Activate', formatter: viewSessionIcon, width: 80, hozAlign: 'center', vertAlign: 'middle', cellClick: (_, cell) => viewSessionClick(cell) }
  ]
});

const sessionCommIfacesTable = new Tabulator('#vc-session-comm-ifaces-tabulator', {
  data: sessions,
  layout: 'fitColumns',
  columns: [
    { title: 'Name', field: 'name', validator: ['required', 'string', 'unique'], editable: true, editor: 'input', cellEdited: sessionNameCellEdited }
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

const loadSessions = () => {
  console.info('Loading sessions');
  try {
    window.visualCal.sessionManager.getAll();
  } catch (error) {
    alert(error.message);
    throw error;
  }
}

const refreshSessions = (newSessions: Session[]) => {
  try {
    console.info('Got sessions', newSessions);
    const areListsDifferent = areSessionListsDifferent(newSessions);
    if (!areListsDifferent) {
      console.info('Session lists are not different, aborting update');
      return;
    }
    sessions = newSessions;
    sessionsTable.setData(sessions);
    sessionCommIfacesTable.setData([]);
  } catch (error) {
    alert(error.message);
    throw error;
  }
}

// ***** INIT *****

const init = () => {
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

  createSessionCommsIfaceButton = document.getElementById('vc-card-session-comm-ifaces-create-button') as HTMLButtonElement;
  createSessionCommsIfaceButton.addEventListener('click', () => {
    if (!selectedSession) {
      alert('Please select a session first');
      return;
    }
    window.visualCal.electron.showCreateCommIfaceWindow(selectedSession.name);
  });

  loadProcedures();
  loadSessions();

  window.visualCal.procedureManager.getActive();
}

init();
