import Tabulator from 'tabulator-tables';
import { ipcRenderer } from 'electron';
import { IpcChannels } from '../../../constants';
import { LoadResponseArgs, SaveOneResponseArgs } from '../../managers/RendererResultManager';
import { TriggerOptions } from '../../../main/node-red/utils/actions';
import { SessionViewWindowOpenIPCInfo } from '../../../@types/session-view';

// ***** LOG *****

const logEntries: any[] = [];
let sessionLogTable = new Tabulator('#vc-session-log', {
  data: logEntries,
  layout: 'fitColumns',
  columns: [
    { title: 'Type', field: 'type' },
    { title: 'Session', field: 'sessionId' },
    { title: 'Run', field: 'runId' },
    { title: 'Section', field: 'section' },
    { title: 'Action', field: 'action' },
    { title: 'State', field: 'state' },
    { title: 'Message', field: 'message' }
  ]
});

ipcRenderer.on(IpcChannels.log.all, (_, entry: any) => {
  logEntries.push(entry);
  sessionLogTable.setData(logEntries);
});

interface CommInterfaceLogEntry {
  name: string;
  message: string;
}

const commInterfaceLogEntries: CommInterfaceLogEntry[] = [];
let commInterfacesLogTable = new Tabulator('#vc-comm-interface-log', {
  data: commInterfaceLogEntries,
  layout: 'fitColumns',
  columns: [
    { title: 'Interface Name', field: 'name' },
    { title: 'Message', field: 'message' }
  ]
});

const addCommInterfaceLogEntry = (entry: CommInterfaceLogEntry) => {
  console.info(entry);
  commInterfaceLogEntries.push(entry);
  commInterfacesLogTable.setData(commInterfaceLogEntries);
}

window.visualCal.communicationInterfaceManager.on('interfaceConnected', (info) => addCommInterfaceLogEntry({ name: info.name, message: 'Connected'}));
window.visualCal.communicationInterfaceManager.on('interfaceConnecting', (info) => addCommInterfaceLogEntry({ name: info.name, message: 'Connecting' }));
window.visualCal.communicationInterfaceManager.on('interfaceDisconnected', (info) => addCommInterfaceLogEntry({ name: info.name, message: 'Disconnected' }));
window.visualCal.communicationInterfaceManager.on('interfaceError', (info) => addCommInterfaceLogEntry({ name: info.name, message: `Error:  ${info.err.message}` }));
window.visualCal.communicationInterfaceManager.on('interfaceStringReceived', (info) => addCommInterfaceLogEntry({ name: info.name, message: `Data received: ${info.data}` }));

// ***** END LOG *****

let sessionName: string = '';
let session: Session = { name: '', procedureName: '', username: '', configuration: { devices: [], interfaces: [] } };
let sections: SectionInfo[] = [];
let actions: ActionInfo[] = [];
let results: LogicResult[] = [];
let deviceConfigurationNodeInfosForCurrentFlow: DeviceNodeDriverRequirementsInfo[] = [];
const devices: CommunicationInterfaceDeviceNodeConfiguration[] = [];

const onSectionRowSelected = (selectedRow: Tabulator.RowComponent) => {
  const section = selectedRow.getData() as SectionInfo;
  actions = section.actions;
  actionsTable.setData(actions);
}

const sectionsTable = new Tabulator('#vc-sections-tabulator', {
  data: sections,
  layout: 'fitColumns',
  selectable: 1,
  rowSelected: onSectionRowSelected,
  columns: [
    { title: 'Name', field: 'name' }
  ]
});

const onActionRowSelected = (selectedRow: Tabulator.RowComponent) => {
  // const action = selectedRow.getData() as ActionInfo;
}

const startStopActionIcon = () => {
  if (session.lastSectionName && session.lastActionName) return '<button>Stop</button>'; // Already triggered
  return '<button>Start</button>';
}

const procedureStatusElement = document.getElementById('vc-procedure-status') as HTMLHeadingElement;
const runningSectionElement = document.getElementById('vc-running-section') as HTMLHeadingElement;
const runningActionElement = document.getElementById('vc-running-action') as HTMLHeadingElement;

let isRunning = false;

window.visualCal.actionManager.on('stateChanged', (info) => {
  runningSectionElement.innerHTML = info.section;
  runningActionElement.innerHTML = info.section;
  switch (info.state) {
    case 'completed':
      procedureStatusElement.innerText = 'Ready';
      runningSectionElement.innerHTML = 'None';
      runningActionElement.innerHTML = 'Completed';
      session.lastSectionName = undefined;
      session.lastActionName = undefined;
      if (lastActionCell) lastActionCell.getRow().reformat();
      isRunning = false;
      break;
    case 'started':
      procedureStatusElement.innerText = 'Running';
      isRunning = true;
      break;
    case 'stopped':
      procedureStatusElement.innerText = 'Stopped';
      runningSectionElement.innerHTML = 'None';
      runningActionElement.innerHTML = 'None';
      isRunning = false;
      session.lastSectionName = undefined;
      session.lastActionName = undefined;
      if (lastActionCell) lastActionCell.getRow().reformat();6
      break;
  }
});

let lastActionCell: Tabulator.CellComponent | undefined = undefined;

const startStopActionClick = async (cell: Tabulator.CellComponent) => {
  const section = sectionsTable.getSelectedRows()[0].getData() as SectionInfo;
  const action = cell.getRow().getData() as ActionInfo;
  devices.forEach(d => d.gpib = { address: d.gpibAddress });
  session.configuration.devices = devices;
  const opts: TriggerOptions = {
    action: action.name,
    section: section.shortName,
    sessionId: sessionName,
    runId: Date.now().toString(),
    type: 'start',
    session: session
  };
  if (session.lastSectionName && session.lastActionName) {
    opts.type = 'stop'; // Already triggered
    session.lastSectionName = undefined;
    session.lastActionName = undefined;
  } else {
    session.lastSectionName = section.name;
    session.lastActionName = action.name;
  }
  window.visualCal.actionManager.trigger(opts);
  cell.getRow().reformat();
  lastActionCell = cell;
}

const actionsTable = new Tabulator('#vc-actions-tabulator', {
  data: actions,
  layout: 'fitColumns',
  selectable: 1,
  rowSelected: onActionRowSelected,
  columns: [
    { title: 'Name', field: 'name' },
    { title: 'Start', formatter: startStopActionIcon, minWidth: 100, hozAlign: 'center', vertAlign: 'middle', cellClick: (_, cell) => startStopActionClick(cell) }
  ]
});

const resultsTable = new Tabulator('#vc-results-tabulator', {
  data: results,
  layout: 'fitColumns',
  columns: [
    { title: 'Run name', field: 'runId' },
    { title: 'Section', field: 'section' },
    { title: 'Action', field: 'action' },
    { title: 'Type', field: 'type' },
    { title: 'Description', field: 'description' },
    { title: 'Timestamp', field: 'timestamp' },
    { title: 'Base EU', field: 'baseQuantity' },
    { title: 'Derived EU', field: 'derivedQuantity' },
    { title: 'Nominal', field: 'inputLevel' },
    { title: 'Minimum', field: 'minimum' },
    { title: 'Maximum', field: 'maximum' },
    { title: 'Raw', field: 'rawValue' },
    { title: 'Measured', field: 'measuredValue' },
    { title: 'Passed', field: 'passed' }
  ]
});

const devicesTableGetDrivers = (cell: Tabulator.CellComponent) => {
  const deviceInfo = cell.getRow().getData() as CommunicationInterfaceDeviceNodeConfiguration;
  const foundDeviceConfig = deviceConfigurationNodeInfosForCurrentFlow.find(d => d.unitId === deviceInfo.unitId);
  if (!foundDeviceConfig) throw new Error('Unable to find device config');
  const retVal: Tabulator.SelectParams = {
    values: foundDeviceConfig.availableDrivers.map(d => d.displayName)
  };
  return retVal;
}

const devicesTableGetCommInterfaces = () => {
  const retVal: Tabulator.SelectParams = {
    values: session.configuration.interfaces.map(d => d.name)
  };
  return retVal;
}

const devicesTable = new Tabulator('#vc-devices-tabulator', {
  data: devices,
  layout: 'fitColumns',
  columns: [
    { title: 'Device Unit Id', field: 'unitId' },
    { title: 'Driver', field: 'driverDisplayName', editor: 'select', editorParams: (cell) => devicesTableGetDrivers(cell) },
    { title: 'Interface', field: 'interfaceName', editor: 'select', editorParams: () => devicesTableGetCommInterfaces() },
    { title: 'GPIB Address', field: 'gpibAddress', editor: 'number' }
  ]
});

const init = () => {
  ipcRenderer.on(IpcChannels.sessions.viewInfo.response, (_, viewInfo: SessionViewWindowOpenIPCInfo) => {
    sessionName = viewInfo.session.name;
    session = viewInfo.session;
    sections = viewInfo.sections;
    deviceConfigurationNodeInfosForCurrentFlow = viewInfo.deviceConfigurationNodeInfosForCurrentFlow;
    deviceConfigurationNodeInfosForCurrentFlow.forEach(deviceInfo => {
      devices.push({
        configNodeId: deviceInfo.configNodeId,
        driverDisplayName: '',
        gpibAddress: 1,
        interfaceName: '',
        unitId: deviceInfo.unitId
      });
    });
    devicesTable.setData(devices);
    sectionsTable.setData(sections);
    if (sections.length > 0) {
      const firstSection = sections[0];
      if (firstSection.actions.length > 0) {
        actions = firstSection.actions;
        actionsTable.setData(actions);
      }
    }
    window.visualCal.resultsManager.load(sessionName);
  });

  ipcRenderer.on(IpcChannels.sessions.viewInfo.error, (_, error: Error) => {
    window.visualCal.electron.showErrorDialog(error);
  });

  ipcRenderer.on(IpcChannels.actions.trigger.error, (_, error: Error) => {
    if (error.message) {
      alert(error.message);
    } else {
      alert(error);
    }
  });

  window.visualCal.resultsManager.on(IpcChannels.results.load.response, (response: LoadResponseArgs) => {
    results = response.results;
    resultsTable.setData(results);
  });

  window.visualCal.actionManager.on('resultAcquired', (info) => {
    results.push(info.result);
    resultsTable.setData(results);
  });

  ipcRenderer.send(IpcChannels.sessions.viewInfo.request);
}

const resetButton: HTMLButtonElement = document.getElementById('vc-reset-button') as HTMLButtonElement;
resetButton.addEventListener('click', () => {
  const triggerOpts: TriggerOptions = {
    action: '',
    section: '',
    sessionId: sessionName,
    runId: Date.now().toString(),
    type: 'start'
  };
  session.lastSectionName = undefined;
  session.lastActionName = undefined;
  actionsTable.getRows().forEach(row => row.reformat());
  window.visualCal.actionManager.trigger(triggerOpts);
});

init();
