import { ipcRenderer } from 'electron';
import Tabulator from 'tabulator-tables';
import { SessionViewWindowOpenIPCInfo } from '../../../../@types/session-view';
import { IpcChannels } from '../../../../constants';
import { TriggerOptions } from '../../../../nodes/indysoft-action-start-types';
import { LoadResponseArgs } from '../../../managers/RendererResultManager';
import { ProcedureHandler } from './ProcedureHandler';
import { StatusHandler } from './StatusHandler';

const startStopActionButtonElement = document.getElementById('vc-start-stop-button') as HTMLButtonElement;
const resetButton: HTMLButtonElement = document.getElementById('vc-reset-button') as HTMLButtonElement;

const clearDeviceLogButtonElement = document.getElementById('vc-clear-device-log') as HTMLButtonElement;

const benchConfigsSelectElement = document.getElementById('vc-bench-config-select') as HTMLSelectElement;

const logEntries: any[] = [];
const devices: CommunicationInterfaceDeviceNodeConfiguration[] = [];

let results: LogicResult[] = [];

let sessionName: string = '';
let session: Session = { name: '', procedureName: '', username: '', configuration: { devices: [] } };
let deviceConfigurationNodeInfosForCurrentFlow: DeviceNodeDriverRequirementsInfo[] = [];

// ================================================================================================
//  Status handler
// ================================================================================================
const status = new StatusHandler({
  procedureStatusElementId: 'vc-procedure-status',
  sectionStatusElementId: 'vc-running-section',
  actionStatusElementId: 'vc-running-action'
});

status.on('stateChanged', (info) => {
  if (info.state === 'stopped' || info.state === 'completed') {
    startStopActionButtonElement.textContent = 'Start';
    session.lastSectionName = undefined;
    session.lastActionName = undefined;
    if (info.state === 'completed') alert('Action completed');
  } else if (info.state === 'started') {
    startStopActionButtonElement.textContent = 'Stop';
    session.lastSectionName = info.section;
    session.lastActionName = info.action;
  }
});

// ************************************************************************************************

// ================================================================================================
//  Procedure handler
// ================================================================================================
const procedure = new ProcedureHandler({
  sectionElementId: 'vc-section-select',
  actionElementId: 'vc-action-select',
  runTimeElementId: 'vc-run-name-text-input'
});

procedure.on('ready', () => updateStartStopActionButton());
procedure.on('notReady', () => updateStartStopActionButton());
// ************************************************************************************************

clearDeviceLogButtonElement.addEventListener('click', () => {
  commInterfaceLogEntries.length = 0;
  commInterfacesLogTable.setData(commInterfaceLogEntries);
});

startStopActionButtonElement.disabled = true;

const getSelectedBenchconfig = () => {
  const selected = benchConfigsSelectElement.selectedOptions[0];
  if (!selected) return undefined;
  return JSON.parse(selected.value) as BenchConfig;
}

const updateStartStopActionButton = () => {
  let disabled = false;
  disabled = disabled || !procedure.isReady;
  disabled = disabled || !getSelectedBenchconfig();
  disabled = disabled || !procedure.runName;
  startStopActionButtonElement.disabled = disabled;
}

startStopActionButtonElement.addEventListener('click', (ev) => {
  ev.preventDefault();
  const section = procedure.sectionHandler.selectedItem;
  const action = procedure.actionHandler.selectedItem;
  if (!section || !action) {
    alert('The start/stop button was supposed to be disabled.  This is a bug.');
    return;
  }
  devices.forEach(d => d.gpib = { address: d.gpibAddress });
  if (!session.configuration) {
    window.visualCal.electron.showErrorDialog(new Error(`Session, ${session.name}, does not have a configuration`));
    return;
  }
  session.configuration.devices = devices;
  const opts: TriggerOptions = {
    action: action.name,
    section: section.shortName,
    runId: Date.now().toString(),
    session: session
  };
  if (session.lastSectionName && session.lastActionName) {
    window.visualCal.actionManager.stop(opts);
    session.lastSectionName = undefined;
    session.lastActionName = undefined;
  } else {
    window.visualCal.actionManager.start(opts);
    session.lastSectionName = section.name;
    session.lastActionName = action.name;
  }
});

// ***** LOG *****

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
  commInterfaceLogEntries.push(entry);
  commInterfacesLogTable.setData(commInterfaceLogEntries);
};

window.visualCal.communicationInterfaceManager.on('interfaceConnected', (info) => addCommInterfaceLogEntry({ name: info.name, message: 'Connected' }));
window.visualCal.communicationInterfaceManager.on('interfaceConnecting', (info) => addCommInterfaceLogEntry({ name: info.name, message: 'Connecting' }));
window.visualCal.communicationInterfaceManager.on('interfaceDisconnected', (info) => addCommInterfaceLogEntry({ name: info.name, message: 'Disconnected' }));
window.visualCal.communicationInterfaceManager.on('interfaceError', (info) => addCommInterfaceLogEntry({ name: info.name, message: `Error:  ${info.err.message}` }));
window.visualCal.communicationInterfaceManager.on('interfaceStringReceived', (info) => addCommInterfaceLogEntry({ name: info.name, message: `Data received: ${info.data}` }));
window.visualCal.communicationInterfaceManager.on('interfaceWrite', (info) => {
  const dataString = new TextDecoder().decode(info.data);
  addCommInterfaceLogEntry({ name: info.name, message: `Data sent: ${dataString}` });
});

// ***** END LOG *****

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
};

const getBenchConfigurationInterfaces = () => {
  if (!window.visualCal.initialLoadData || !window.visualCal.initialLoadData.user || !window.visualCal.initialLoadData.session || !window.visualCal.initialLoadData.session.configuration || !window.visualCal.initialLoadData.session.configuration.benchConfigName) return [];
  const config = window.visualCal.initialLoadData.user?.benchConfigs.find(b => b.name === window.visualCal.initialLoadData?.session?.configuration?.benchConfigName);
  if (!config) return [];
  return config.interfaces;
}

const devicesTableGetCommInterfaces = () => {
  if (!session.configuration || !session.configuration.benchConfigName) return [];
  const retVal: Tabulator.SelectParams = {
    values: getBenchConfigurationInterfaces().map(d => d.name)
  };
  return retVal;
};

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

resetButton.addEventListener('click', () => {
  const triggerOpts: TriggerOptions = {
    action: '',
    section: '',
    runId: Date.now().toString(),
  };
  session.lastSectionName = undefined;
  session.lastActionName = undefined;
  window.visualCal.actionManager.reset(triggerOpts);
});

window.visualCal.actionManager.on('startError', (args) => {
  if (args.err.message) {
    alert(args.err.message);
  } else {
    alert(args.err);
  }
});

window.visualCal.actionManager.on('stopError', (error: Error) => {
  if (error.message) {
    alert(error.message);
  } else {
    alert(error);
  }
});

window.visualCal.actionManager.on('resetError', (error: Error) => {
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

// ================================================================================================
// Initialize
// ================================================================================================
ipcRenderer.on(IpcChannels.session.viewInfo.response, (_, viewInfo: SessionViewWindowOpenIPCInfo) => {
  sessionName = viewInfo.session.name;
  session = viewInfo.session;
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
  procedure.sectionHandler.items = viewInfo.sections;
  window.visualCal.resultsManager.load(sessionName);
  updateStartStopActionButton();
});

ipcRenderer.on(IpcChannels.session.viewInfo.error, (_, error: Error) => {
  window.visualCal.electron.showErrorDialog(error);
});

// Start
updateStartStopActionButton();
ipcRenderer.send(IpcChannels.session.viewInfo.request);

// ************************************************************************************************
