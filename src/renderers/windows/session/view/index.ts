import Tabulator from 'tabulator-tables';
import { TriggerOptions } from '../../../../nodes/indysoft-action-start-types';
import { StateChangeInfo } from '../../../managers/RendererActionManager';
import { DeviceConfigHandler } from './DeviceConfigHandler';
import { DeviceLogHandler } from './DeviceLogHandler';
import { IpcHandler } from './IpcHandler';
import { MainLogHandler } from './MainLogHandler';
import { ProcedureHandler } from './ProcedureHandler';
import { RunHandler } from './RunHandler';
import { StatusHandler } from './StatusHandler';
import { SessionViewWindowOpenIPCInfo } from '../../../../@types/session-view';
import { ipcRenderer } from 'electron';
import { IpcChannels } from '../../../../constants';
import { BenchConfig } from 'visualcal-common/dist/bench-configuration';
import { StartOptions, StopOptions } from '../../../../main/managers/ActionManager';

const startStopActionButtonElement = document.getElementById('vc-start-stop-button') as HTMLButtonElement;
const resetButton: HTMLButtonElement = document.getElementById('vc-reset-button') as HTMLButtonElement;
let devices: CommunicationInterfaceDeviceNodeConfiguration[] = [];
const interceptDeviceWritesCheckbox = document.getElementById('vc-intercept-device-writes') as HTMLInputElement;

let user: User | undefined = undefined;
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
  if (!user || !session) return [];
  const sessionConfiguration = session.configuration;
  if (!sessionConfiguration) return [];
  const config = user.benchConfigs.find(b => b.name === sessionConfiguration.benchConfigName);
  if (!config) return [];
  return config.interfaces;
}

const getDevicesTableGetCommInterfaces = (): Tabulator.SelectParams => {
  const benchConfigInterfaces = getBenchConfigurationInterfaces();
  if (!session.configuration || !session.configuration.benchConfigName) return { values: [] };
  const retVal: Tabulator.SelectParams = {
    values: benchConfigInterfaces ? benchConfigInterfaces.map(d => d.name) : []
  };
  return retVal;
};

const devicesTable = new Tabulator('#vc-devices-tabulator', {
  data: devices,
  layout: 'fitColumns',
  columns: [
    { title: 'Device Unit Id', field: 'unitId' },
    { title: 'Driver', field: 'driverDisplayName', editor: 'select', editorParams: (cell: Tabulator.CellComponent) => devicesTableGetDrivers(cell) },
    { title: 'Interface', field: 'interfaceName', editor: 'select', editorParams: () => getDevicesTableGetCommInterfaces() },
    { title: 'GPIB Address', field: 'gpibAddress', editor: 'number' }
  ]
});

const updateStartStopActionButton = (info?: StateChangeInfo) => {
  let disabled = false;
  // disabled = disabled || !procedure.isReady;
  // // disabled = disabled || !getSelectedBenchconfig();
  // disabled = disabled || !procedure.runName || results.getDoesRunExist(procedure.runName);
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
const runHandler = new RunHandler({
  tableId: 'vc-results-tabulator',
  runManager: window.visualCal.runsManager
});
// ************************************************************************************************

// ================================================================================================
//  Procedure handler
// ================================================================================================
const procedure = new ProcedureHandler({
  titleElementId: 'vc-procedure-title',
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

deviceConfigHandler.on('selectedBenchConfigChanged', async (config) => {
  // TODO: Finish
  if (!config) return;
  if (!session.configuration) {
    session.configuration = { devices: devices, benchConfigName: config.name };
  } else {
    session.configuration.benchConfigName = config.name;
  }
  ipcRenderer.send(IpcChannels.session.update.request, session);
  devices.forEach(d => d.interfaceName = '');
  await devicesTable.setData(devices);
});

ipc.on('benchConfigsUpdated', async (configs) => {
  if (!user) return;
  user.benchConfigs = configs;
  deviceConfigHandler.benchConfigHandler.items = configs;
});

// ************************************************************************************************

// ================================================================================================
// Troubleshooting and reset
// ================================================================================================
resetButton.addEventListener('click', () => {
  const triggerOpts: TriggerOptions = {
    action: '',
    section: '',
    runId: runHandler.currentRunId || ''
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
  if (args.err && typeof args.err === 'object') {
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
  const runName = procedure.runName ? procedure.runName : new Date().toUTCString();
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
  if (session.lastSectionName && session.lastActionName) {
    const stopOpts: StopOptions = {
      runId: runHandler.currentRunId || ''
    }
    window.visualCal.actionManager.stop(stopOpts);
    session.lastSectionName = undefined;
    session.lastActionName = undefined;
  } else {
    const startOpts: StartOptions = {
      actionId: action.name,
      sectionId: section.shortName,
      runDescription: runName,
      session: session
    };
    startOpts.interceptDeviceWrites = interceptDeviceWritesCheckbox.checked;
    const deviceConfigs = devicesTable.getData() as CommunicationInterfaceDeviceNodeConfiguration[];
    startOpts.deviceConfig = deviceConfigs;
    window.visualCal.actionManager.start(startOpts);
    session.lastSectionName = section.name;
    session.lastActionName = action.name;
  }
});

const updateViewInfo = async (viewInfo: SessionViewWindowOpenIPCInfo) => {
  try {
    user = viewInfo.user;
    procedure.setTitle(viewInfo.procedure.name);
    session = viewInfo.session;
    procedure.sectionHandler.items = viewInfo.sections;
    deviceConfigHandler.benchConfigHandler.items = viewInfo.user.benchConfigs;
    let selectedBenchConfig: BenchConfig | undefined = undefined;
    if (session.configuration && session.configuration.benchConfigName) {
      const selectedBenchConfigName = session.configuration.benchConfigName;
      selectedBenchConfig = deviceConfigHandler.benchConfigHandler.items.find(b => b.name === selectedBenchConfigName);
      if (selectedBenchConfig) deviceConfigHandler.benchConfigHandler.selectedItem = selectedBenchConfig;
    }
    deviceConfigurationNodeInfosForCurrentFlow = viewInfo.deviceNodes;
    deviceConfigurationNodeInfosForCurrentFlow.forEach(deviceInfo => {
      const device = {
        configNodeId: deviceInfo.configNodeId,
        driverDisplayName: '',
        gpibAddress: 1,
        interfaceName: '',
        unitId: deviceInfo.unitId,
        isCustom: deviceInfo.isCustom
      };
      if (session.configuration) {
        const foundDevice = session.configuration.devices.find(d => d.configNodeId === deviceInfo.configNodeId);
        if (foundDevice && selectedBenchConfig) {
          device.interfaceName = foundDevice.interfaceName;
        }
      }
      devices.push(device);
    });
    // if (session.configuration && session.configuration.devices && session.configuration.devices.length > 0) devices = session.configuration.devices;
    await devicesTable.setData(devices);
  } catch (error) {
    window.visualCal.electron.showErrorDialog(error);
  }
}

const init = async () => {
  try {
    const info = await ipc.getViewInfo();
    await updateViewInfo(info);
    ipc.on('viewInfoReceived', async (viewInfo) => await updateViewInfo(viewInfo));
  } catch (error) {
    window.visualCal.electron.showErrorDialog(error);
  }
}

init();
// ************************************************************************************************
