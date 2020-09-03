import { IpcChannels } from '../../constants';
import { GetAllResponseArgs, RenameResponseArgs, CreateResponseArgs, RemoveResponseArgs, UpdateResponseArgs, SetActiveResponseArgs, GetAllCommunicationInterfacesResponse } from '../managers/RendererCRUDManager';
import { ipcRenderer } from 'electron';
import moment from 'moment';
import Tabulator from 'tabulator-tables';

const activateSessionIcon = (cell: Tabulator.CellComponent, formatterParams: Tabulator.FormatterParams, onRendered: any) => {
  return '<button>Activate</button>';
}

const viewSessionIcon = (cell: Tabulator.CellComponent, formatterParams: Tabulator.FormatterParams, onRendered: any) => {
  return '<button>View</button>';
}

const removeButtonIcon = (cell: Tabulator.CellComponent, formatterParams: Tabulator.FormatterParams, onRendered: any) => {
  return '<button>Remove</button>';
}

// ***** PROCEDURES *****

let activeProcedureHeading: HTMLHeadingElement;
let createProcedureButton: HTMLButtonElement;
let procedures: ProcedureInfo[] = [];

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
  window.visualCal.procedureManager.on(IpcChannels.procedures.getAll.response, (response: GetAllResponseArgs<ProcedureInfo>) => {
    console.info('GetAll', response.items);
    refreshProcedures(response.items);
  });
  window.visualCal.procedureManager.on(IpcChannels.procedures.update.response, (response: UpdateResponseArgs<ProcedureInfo>) => {
    console.info('Update', response.item);
    loadProcedures();
  });
  window.visualCal.procedureManager.on(IpcChannels.procedures.setActive.response, (response: SetActiveResponseArgs) => {
    console.info('setActive', response.name);
    activeProcedureHeading.innerText = response.name;
  });

  ipcRenderer.on(IpcChannels.procedures.remove.error, (_, error: Error) => alert(error.message));
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
  ipcRenderer.once(IpcChannels.procedures.update.response, (_, procedure: ProcedureInfo) => {
    alert(`Procedure, ${procedure.name}, updated`);
  });
  proc.description = newDesc;
  window.visualCal.procedureManager.update(proc);
}

const removeProcedureClick = (cell: Tabulator.CellComponent) => {
  const proc = cell.getRow().getData() as Procedure;
  window.visualCal.procedureManager.remove(proc.name);
}

const proceduresTable = new Tabulator('#vc-procedures-tabulator', {
  data: procedures,
  layout: 'fitColumns',
  columns: [
    { title: 'Name', field: 'name', validator: ['required', 'string', 'unique'], editable: true, editor: 'input', cellEdited: procedureNameCellEdited },
    { title: 'Description', field: 'description', editable: true, editor: 'textarea', cellEdited: procedureDescriptionCellEdited },
    { title: '', formatter: removeButtonIcon, width: 80, hozAlign: 'center', vertAlign: 'middle', cellClick: (_, cell) => removeProcedureClick(cell) }
  ]
});

const loadProcedures = () => {
  console.info('Loading procedures');
  try {
    window.visualCal.procedureManager.getAll();
  } catch (error) {
    alert(error.message);
    throw error;
  }
}

const refreshProcedures = (newProcedures: ProcedureInfo[]) => {
  try {
    console.info('Got procedures', newProcedures);
    procedures = newProcedures;
    proceduresTable.setData(procedures);
  } catch (error) {
    alert(error.message);
    throw error;
  }
}

// ***** SESSIONS *****

interface SessionCommunicationInterfaceInfo extends CommunicationInterfaceConfigurationInfo {
  sessionName: string;
}

const commsInterfacesSelectedSessionNameHeading: HTMLHeadingElement = document.getElementById('vc-session-name-comm-ifaces') as HTMLHeadingElement;

let createSessionButton: HTMLButtonElement;
let sessions: Session[] = [];
let selectedSession: Session | null = null;
let createSessionCommsIfaceButton: HTMLButtonElement;

const initSessionListeners = () => {
  window.visualCal.sessionManager.on(IpcChannels.session.create.response, (response: CreateResponseArgs<Session>) => {
    console.info('Created', response.item);
    loadSessions();
  });
  window.visualCal.sessionManager.on(IpcChannels.session.rename.response, (response: RenameResponseArgs) => {
    console.info('Renamed', response.oldName, response.newName);
    loadSessions();
  });
  window.visualCal.sessionManager.on(IpcChannels.session.remove.response, (response: RemoveResponseArgs) => {
    console.info('Removed', response.name);
    loadSessions();
  });
  window.visualCal.sessionManager.on(IpcChannels.session.getAll.response, (response: GetAllResponseArgs<Session>) => {
    console.info('GetAll', response.items);
    refreshSessions(response.items);
  });
  window.visualCal.sessionManager.on(IpcChannels.session.update.response, (response: UpdateResponseArgs<Session>) => {
    console.info('Update', response.item);
    loadSessions();
  });
  window.visualCal.sessionManager.on(IpcChannels.session.getCommunicationInterfaces.response, (response: GetAllCommunicationInterfacesResponse) => {
    console.info('GetAllCommunicationInterfacesResponse', response.iface);
    loadSessions();
  });

  ipcRenderer.on(IpcChannels.session.createCommunicationInterface.response, (_, response: { sessionName: string, iface: CommunicationInterfaceConfigurationInfo }) => {
    console.info('createCommuniationInterface', response);
    loadSessions();
    refreshSessionCommIfaces(selectedSessionRow);
  });
  ipcRenderer.on(IpcChannels.session.removeCommunicationInterface.response, (_, response: { sessionName: string, ifaceName: string }) => {
    const session = sessions.find(s => s.name === response.sessionName);
    if (!session) return;
    const index = session.configuration.interfaces.findIndex(i => i.name === response.ifaceName);
    if (index >= 0) session.configuration.interfaces.splice(index);
    loadSessions();
  });

  ipcRenderer.on(IpcChannels.session.createCommunicationInterface.error, (_, error: Error) => alert(error.message));
  ipcRenderer.on(IpcChannels.session.removeCommunicationInterface.error, (_, error: Error) => alert(error.message));
}

const sessionNameCellEdited = (cell: Tabulator.CellComponent) => {
  const oldName = cell.getOldValue() as string;
  const newName = cell.getValue() as string;
  ipcRenderer.once(IpcChannels.session.getExists.response, (_, exists: boolean) => {
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
  ipcRenderer.once(IpcChannels.session.update.response, (_, session: Session) => {
    alert(`Session, ${session.name}, updated`);
  });
  session.procedureName = newProcedureName;
  window.visualCal.sessionManager.update(session);
}

const activateSessionClick = (cell: Tabulator.CellComponent) => {
  const sessionName = cell.getRow().getCell('name').getValue() as string;
  window.visualCal.sessionManager.setActive(sessionName);
}

const viewSessionClick = (cell: Tabulator.CellComponent) => {
  const sessionName = cell.getRow().getCell('name').getValue() as string;
  window.visualCal.electron.showViewSessionWindow(sessionName);
}

const removeSessionClick = (cell: Tabulator.CellComponent) => {
  const sessionName = cell.getRow().getCell('name').getValue() as string;
  window.visualCal.sessionManager.remove(sessionName);
}

const removeSessionCommInterfaceClick = (cell: Tabulator.CellComponent) => {
  const ifaceInfo = cell.getRow().getData() as SessionCommunicationInterfaceInfo;
  window.visualCal.sessionManager.removeCommunicationInterface(ifaceInfo.sessionName, ifaceInfo.name);
}

let selectedSessionRow: Tabulator.RowComponent | undefined = undefined;
const refreshSessionCommIfaces = (selectedRow?: Tabulator.RowComponent) => {
  const sessionRows = sessionsTable.getRows();
  selectedSessionRow = selectedRow;
  if (!selectedRow && sessionRows.length > 0) selectedRow = sessionsTable.getRows()[0];
  if (!selectedRow) {
    selectedSessionRow = undefined;
    sessionCommIfacesTable.setData([]);
    commsInterfacesSelectedSessionNameHeading.innerText = '[ No session selected ]';
    return;
  };
  selectedSession = selectedRow.getData() as Session;
  commsInterfacesSelectedSessionNameHeading.innerText = ` - Selected session ${selectedSession.name}`;
  const sessionIfaces: SessionCommunicationInterfaceInfo[] = [];
  selectedSession.configuration.interfaces.forEach(iface => {
    if (selectedSession) {
      const sessionIface: SessionCommunicationInterfaceInfo = {
        sessionName: selectedSession.name,
        ...iface
      };
      sessionIfaces.push(sessionIface);
    }
  });
  sessionCommIfacesTable.setData(sessionIfaces);
}
const sessionsTable = new Tabulator('#vc-sessions-tabulator', {
  data: sessions,
  layout: 'fitColumns',
  rowClick: (_, row) => refreshSessionCommIfaces(row),
  columns: [
    { title: 'Name', field: 'name', validator: ['required', 'string', 'unique'], editable: true, editor: 'input', cellEdited: sessionNameCellEdited },
    { title: 'Procedure', field: 'procedureName', editable: true, editor: 'select', editorParams: () => procedures.map(p => p.name), cellEdited: sessionProcedureCellEdited },
    { title: 'Username', field: 'username', editable: false, minWidth: 120 },
    { title: '', formatter: activateSessionIcon, width: 80, hozAlign: 'center', vertAlign: 'middle', cellClick: (_, cell) => activateSessionClick(cell) },
    { title: '', formatter: viewSessionIcon, width: 80, hozAlign: 'center', vertAlign: 'middle', cellClick: (_, cell) => viewSessionClick(cell) },
    { title: '', formatter: removeButtonIcon, width: 80, hozAlign: 'center', vertAlign: 'middle', cellClick: (_, cell) => removeSessionClick(cell) }
  ]
});

const sessionCommIfacesTable = new Tabulator('#vc-session-comm-ifaces-tabulator', {
  data: sessions,
  layout: 'fitColumns',
  columns: [
    { title: 'Name', field: 'name', validator: ['required', 'string', 'unique'], editable: true, editor: 'input' },
    { title: 'Type', field: 'type', validator: ['required', 'string', 'unique'], editable: true, editor: 'input' },
    { title: '', formatter: removeButtonIcon, width: 80, hozAlign: 'center', vertAlign: 'middle', cellClick: (_, cell) => removeSessionCommInterfaceClick(cell) }
  ]
});

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
    sessions = newSessions;
    sessionsTable.setData(sessions);
    selectedSession = sessions[0];
    sessionCommIfacesTable.setData([]);
    refreshSessionCommIfaces();
  } catch (error) {
    alert(error.message);
    throw error;
  }
}

// ***** INIT *****

const init = () => {
  commsInterfacesSelectedSessionNameHeading.innerText = '[ No session selected ]';

  initProcedureListeners();
  initSessionListeners();

  activeProcedureHeading = document.getElementById('vc-procedure-active-heading') as HTMLHeadingElement;

  createProcedureButton = document.getElementById('vc-card-procedures-create-button') as HTMLButtonElement;
  createProcedureButton.addEventListener('click', () => window.visualCal.electron.showWindow(VisualCalWindow.CreateProcedure));

  createSessionButton = document.getElementById('vc-card-sessions-create-button') as HTMLButtonElement;
  createSessionButton.addEventListener('click', () => window.visualCal.electron.showWindow(VisualCalWindow.CreateSession));

  createSessionCommsIfaceButton = document.getElementById('vc-card-session-comm-ifaces-create-button') as HTMLButtonElement;
  createSessionCommsIfaceButton.addEventListener('click', () => {
    if (!selectedSession) {
      alert('Please select a session first');
      return;
    }
    window.visualCal.electron.showCreateCommIfaceWindow();
  });

  loadProcedures();
  loadSessions();

  window.visualCal.procedureManager.getActive();
}

init();
