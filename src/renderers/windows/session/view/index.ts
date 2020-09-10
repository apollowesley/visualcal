import Tabulator from 'tabulator-tables';
import { TriggerOptions } from '../../../../nodes/indysoft-action-start-types';
import { StateChangeInfo } from '../../../managers/RendererActionManager';
import { DeviceConfigHandler } from './DeviceConfigHandler';
import { DeviceLogHandler } from './DeviceLogHandler';
import { IpcHandler } from './IpcHandler';
import { MainLogHandler } from './MainLogHandler';
import { ProcedureHandler } from './ProcedureHandler';
import { ResultHandler } from './ResultHandler';
import { StatusHandler } from './StatusHandler';

const startStopActionButtonElement = document.getElementById('vc-start-stop-button') as HTMLButtonElement;
const resetButton: HTMLButtonElement = document.getElementById('vc-reset-button') as HTMLButtonElement;
const benchConfigsSelectElement = document.getElementById('vc-bench-config-select') as HTMLSelectElement;
const devices: CommunicationInterfaceDeviceNodeConfiguration[] = [];



let session: Session = { name: '', procedureName: '', username: '', configuration: { devices: [] } };
let deviceConfigurationNodeInfosForCurrentFlow: DeviceNodeDriverRequirementsInfo[] = [];

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

const updateStartStopActionButton = (info?: StateChangeInfo) => {
  let disabled = false;
  disabled = disabled || !procedure.isReady;
  // disabled = disabled || !getSelectedBenchconfig();
  disabled = disabled || !procedure.runName || results.getDoesRunExist(procedure.runName);
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
//  IPC handler
// ================================================================================================
const ipc = new IpcHandler();

ipc.on('mainLogEntry', async (entry) => mainLog.add(entry));
// ************************************************************************************************

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
//  Main log handler
// ================================================================================================
const mainLog = new MainLogHandler({
  clearButtonElementId: 'vc-clear-button',
  tableId: 'vc-session-log'
});
// ************************************************************************************************

// ================================================================================================
//  Device log handler
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
  clearResultsElementId: 'vc-clear-results-button',
  runsSelectElementId: 'vc-runs-select'
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
procedure.on('runNameChanged', () => updateStartStopActionButton());
// ************************************************************************************************

// ================================================================================================
// Bench and device configuration
// ================================================================================================
const deviceConfigHandler = new DeviceConfigHandler({
  configsSelectElementId: 'vc-bench-config-select'
});

deviceConfigHandler.on('selectedBenchConfigChanged', (config) => {
  // TODO: Finish
  if (config) alert(config.name);
});

// ************************************************************************************************

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
startStopActionButtonElement.disabled = true;

startStopActionButtonElement.addEventListener('click', (ev) => {
  ev.preventDefault();
  const section = procedure.sectionHandler.selectedItem;
  const action = procedure.actionHandler.selectedItem;
  const runName = procedure.runName;
  if (!section || !action || !runName) {
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
    runId: runName,
    session: session
  };
  if (session.lastSectionName && session.lastActionName) {
    window.visualCal.actionManager.stop(opts);
    session.lastSectionName = undefined;
    session.lastActionName = undefined;
  } else {
    results.addRun(runName);
    window.visualCal.actionManager.start(opts);
    session.lastSectionName = section.name;
    session.lastActionName = action.name;
  }
});

const init = async () => {
  try {
    const info = await ipc.getViewInfo();
    session = info.session;
    deviceConfigurationNodeInfosForCurrentFlow = info.deviceNodes;
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
    procedure.sectionHandler.items = info.sections;
    deviceConfigHandler.benchConfigHandler.items = info.user.benchConfigs;
  } catch (error) {
    window.visualCal.electron.showErrorDialog(error);
  }
}

init();
// ************************************************************************************************
