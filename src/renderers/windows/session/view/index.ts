import Tabulator from 'tabulator-tables';
import { StateChangeInfo } from '../../../managers/RendererActionManager';
import { DeviceConfigHandler } from './DeviceConfigHandler';
import { DeviceLogHandler } from './DeviceLogHandler';
import { IpcHandler } from './IpcHandler';
import { ProcedureHandler } from './ProcedureHandler';
import { RunHandler } from './RunHandler';
import { StatusHandler } from './StatusHandler';
import { SessionViewWindowOpenIPCInfo } from '../../../../@types/session-view';
import { ipcRenderer } from 'electron';
import { IpcChannels } from '../../../../constants';
import { BenchConfig } from 'visualcal-common/dist/bench-configuration';
import { StartOptions } from '../../../../main/managers/ActionManager';

const startStopActionButtonElement = document.getElementById('action-start-stop-button') as HTMLButtonElement;
let devices: CommunicationInterfaceDeviceNodeConfiguration[] = [];
const interceptDeviceWritesCheckbox = document.getElementById('action-intercept-device-commands') as HTMLInputElement;

let user: User | undefined = undefined;
let session: Session = { name: '', procedureName: '', username: '', configuration: { devices: [] } };
let deviceConfigurationNodeInfosForCurrentFlow: DeviceNodeDriverRequirementsInfo[] = [];

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

function getIsDeviceGpibAddressEditable(cell: Tabulator.CellComponent) {
  const deviceConfig = cell.getRow().getData() as CommunicationInterfaceDeviceNodeConfiguration;
  const selectedInterface = getBenchConfigurationInterfaces().find(i => i.name === deviceConfig.interfaceName);
  if (!selectedInterface) return false;
  return selectedInterface.type === 'National Instruments GPIB' || selectedInterface.type === 'Prologix GPIB TCP' || selectedInterface.type === 'Prologix GPIB USB';
}

function getDeviceGpibAddressFormatter(cell: Tabulator.CellComponent) {
  const deviceConfig = cell.getRow().getData() as CommunicationInterfaceDeviceNodeConfiguration;
  const isGpibInterfaceSelected = getIsDeviceGpibAddressEditable(cell);
  const divElement = document.createElement('div');
  divElement.style.height = '100%';
  divElement.style.width = '100%';
  if (isGpibInterfaceSelected) {
    divElement.innerText = deviceConfig.gpibAddress.toString();
  } else {
    divElement.innerText = '';
    divElement.style.backgroundColor = 'silver';
  }
  return divElement;
}

const reformatDevicesTable = () => {
  devicesTable.getRows().forEach(row => row.reformat());
  devicesTable.redraw(true);
};

const devicesTable = new Tabulator('#device-config-table', {
  data: devices,
  layout: 'fitDataFill',
  height: '85%',
  dataChanged: reformatDevicesTable,
  columns: [
    { title: 'Device Id', field: 'unitId' },
    { title: 'Interface', field: 'interfaceName', editor: 'select', editorParams: getDevicesTableGetCommInterfaces },
    { title: 'Driver', field: 'driverName', editor: 'select' },
    { title: 'GPIB Address', field: 'gpibAddress', editable: getIsDeviceGpibAddressEditable, editor: 'number', formatter: getDeviceGpibAddressFormatter }
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
// ************************************************************************************************

// ================================================================================================
//  Status handler
// ================================================================================================
const status = new StatusHandler({
  procedureStatusElementId: 'procedure-status-running-section',
  sectionStatusElementId: 'procedure-status-running-action',
  actionStatusElementId: 'procedure-status-current'
});

status.on('stateChanged', (info) => updateStartStopActionButton(info));
// ************************************************************************************************

// ================================================================================================
//  Device log handler
// ================================================================================================
const deviceLog = new DeviceLogHandler({
  tableId: 'tabulator-log-table'
});
// ************************************************************************************************

// ================================================================================================
//  Results handler
// ================================================================================================
const runHandler = new RunHandler({
  tableId: 'tabulator-results-table',
  runManager: window.visualCal.runsManager
});
// ************************************************************************************************

// ================================================================================================
//  Procedure handler
// ================================================================================================
const procedure = new ProcedureHandler({
  selectActionElementId: 'action-select',
  runTimeElementId: 'action-run-name'
});

procedure.on('ready', () => updateStartStopActionButton());
procedure.on('notReady', () => updateStartStopActionButton());
procedure.on('runNameChanged', () => updateStartStopActionButton());
// ************************************************************************************************

// ================================================================================================
// Bench and device configuration
// ================================================================================================
const deviceConfigHandler = new DeviceConfigHandler({
  configsSelectElementId: 'bench-config-select'
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
  deviceConfigHandler.updateConfigs(configs);
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

startStopActionButtonElement.addEventListener('click', async (ev) => {
  ev.preventDefault();
  const selectedValue = procedure.selectedValue;
  if (!selectedValue) {
    alert('Invalid selected section and action.  This is a bug');
    return;
  }
  const section = selectedValue.section;
  const action = selectedValue.action;
  const runName = procedure.runName ? procedure.runName : new Date().toUTCString();
  deviceLog.clear();
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
  if ((session.lastSectionName && session.lastActionName) || startStopActionButtonElement.textContent === 'Stop') {
    window.visualCal.actionManager.stop();
    session.lastSectionName = undefined;
    session.lastActionName = undefined;
  } else {
    //   await ($('#user-instruction-input-modal') as any).modal({
    //     backdrop: 'static',
    //     keyboard: false,
    //     focus: true,
    //     show: true
    // });
    const startOpts: StartOptions = {
      actionId: action.name,
      sectionId: section.name,
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
    devices = [];
    user = viewInfo.user;
    session = viewInfo.session;
    procedure.updateSections(viewInfo.sections);
    deviceConfigHandler.updateConfigs(viewInfo.user.benchConfigs);
    let selectedBenchConfig: BenchConfig | undefined = undefined;
    if (session.configuration && session.configuration.benchConfigName) {
      const selectedBenchConfigName = session.configuration.benchConfigName;
      selectedBenchConfig = deviceConfigHandler.selectedValue;
      if (selectedBenchConfig) deviceConfigHandler.setSelectedValue(selectedBenchConfig);
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
    if (session.configuration && session.configuration.devices && session.configuration.devices.length > 0) {
      session.configuration.devices.forEach(d => {
        const deviceIndex = devices.findIndex(device => device.unitId === d.unitId);
        if (deviceIndex > -1) devices[deviceIndex] = d;
      });
    }
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
