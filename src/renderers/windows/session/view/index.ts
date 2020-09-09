import { ipcRenderer } from 'electron';
import Tabulator from 'tabulator-tables';
import { SessionViewWindowOpenIPCInfo } from '../../../../@types/session-view';
import { IpcChannels } from '../../../../constants';
import { TriggerOptions } from '../../../../nodes/indysoft-action-start-types';
import { ProcedureHandler } from './ProcedureHandler';
import { StatusHandler } from './StatusHandler';
import { DeviceLogHandler } from './DeviceLogHandler';
import { ResultHandler } from './ResultHandler';
import { StateChangeInfo } from '../../../managers/RendererActionManager';

const startStopActionButtonElement = document.getElementById('vc-start-stop-button') as HTMLButtonElement;
const resetButton: HTMLButtonElement = document.getElementById('vc-reset-button') as HTMLButtonElement;
const benchConfigsSelectElement = document.getElementById('vc-bench-config-select') as HTMLSelectElement;

let session: Session = { name: '', procedureName: '', username: '', configuration: { devices: [] } };
const devices: CommunicationInterfaceDeviceNodeConfiguration[] = [];
let deviceConfigurationNodeInfosForCurrentFlow: DeviceNodeDriverRequirementsInfo[] = [];

const updateStartStopActionButton = (info?: StateChangeInfo) => {
  let disabled = false;
  disabled = disabled || !procedure.isReady;
  // disabled = disabled || !getSelectedBenchconfig();
  disabled = disabled || !procedure.runName;
  startStopActionButtonElement.disabled = disabled;

  if (!info) return;
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
}

// ================================================================================================
//  Status handler
// ================================================================================================
const status = new StatusHandler({
  procedureStatusElementId: 'vc-procedure-status',
  sectionStatusElementId: 'vc-running-section',
  actionStatusElementId: 'vc-running-action'
});

status.on('stateChanged', (info) => updateStartStopActionButton(info));
// ************************************************************************************************

// ================================================================================================
//  Status handler
// ================================================================================================
const deviceLog = new DeviceLogHandler({
  clearButtonElementId: 'vc-clear-device-log',
  tableId: 'vc-comm-interface-log'
});
// ************************************************************************************************

// ================================================================================================
//  Results handler
// ================================================================================================
const results = new ResultHandler({
  tableId: 'vc-results-tabulator',
  clearResultsElementId: 'vc-clear-results-button'
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

ipcRenderer.on(IpcChannels.log.all, async (_, entry: any) => {
  logEntries.push(entry);
  await sessionLogTable.setData(logEntries);
});

// ***** END LOG *****

// ================================================================================================
// Troubleshooting and reset
// ================================================================================================
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
// ************************************************************************************************

// ================================================================================================
// Action errors
// ================================================================================================
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
// ************************************************************************************************

// ================================================================================================
// Initialize
// ================================================================================================
window.visualCal.onInitialLoadData = (data) => {
  if (data.sections) {
    procedure.sectionHandler.items = data.sections;
  }
}

ipcRenderer.on(IpcChannels.session.viewInfo.response, async (_, viewInfo: SessionViewWindowOpenIPCInfo) => {
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
  await devicesTable.setData(devices);
  results.loadResultsForSession(session.name);
});

ipcRenderer.on(IpcChannels.session.viewInfo.error, (_, error: Error) => {
  window.visualCal.electron.showErrorDialog(error);
});

startStopActionButtonElement.disabled = true;

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

ipcRenderer.send(IpcChannels.session.viewInfo.request);
// ************************************************************************************************


// TODO: Move the remaining code to it's own handler(s)
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