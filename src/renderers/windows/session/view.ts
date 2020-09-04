import { ipcRenderer } from 'electron';
import Tabulator from 'tabulator-tables';
import { SessionViewWindowOpenIPCInfo } from '../../../@types/session-view';
import { IpcChannels } from '../../../constants';
import { TriggerOptions } from '../../../nodes/indysoft-action-start-types';
import { LoadResponseArgs } from '../../managers/RendererResultManager';

const resetButton: HTMLButtonElement = document.getElementById('vc-reset-button') as HTMLButtonElement;
const procedureStatusElement = document.getElementById('vc-procedure-status') as HTMLHeadingElement;
const runningSectionElement = document.getElementById('vc-running-section') as HTMLHeadingElement;
const runningActionElement = document.getElementById('vc-running-action') as HTMLHeadingElement;
const sectionSelectElement = document.getElementById('vc-section-select') as HTMLSelectElement;
const actionSelectElement = document.getElementById('vc-action-select') as HTMLSelectElement;
const startStopActionButtonElement = document.getElementById('vc-start-stop-button') as HTMLButtonElement;
const clearDeviceLogButtonElement = document.getElementById('vc-clear-device-log') as HTMLButtonElement;

const logEntries: any[] = [];
const devices: CommunicationInterfaceDeviceNodeConfiguration[] = [];

let results: LogicResult[] = [];

let sessionName: string = '';
let session: Session = { name: '', procedureName: '', username: '', configuration: { devices: [] } };
let deviceConfigurationNodeInfosForCurrentFlow: DeviceNodeDriverRequirementsInfo[] = [];

clearDeviceLogButtonElement.addEventListener('click', () => {
  commInterfaceLogEntries.length = 0;
  commInterfacesLogTable.setData(commInterfaceLogEntries);
});

const getSelectedSection = () => {
  const selected = sectionSelectElement.selectedOptions[0];
  if (!selected) return undefined;
  return JSON.parse(selected.value) as SectionInfo;
};

const getSelectedAction = () => {
  const selected = actionSelectElement.selectedOptions[0];
  if (!selected) return undefined;
  return JSON.parse(selected.value) as ActionInfo;
};

const clearSelectElementOptions = (el: HTMLSelectElement) => {
  for (let index = 0; index < el.options.length; index++) el.options.remove(index);
};

sectionSelectElement.disabled = true;
actionSelectElement.disabled = true;
startStopActionButtonElement.disabled = true;

sectionSelectElement.addEventListener('change', () => {
  const selectedSection = getSelectedSection();
  clearSelectElementOptions(actionSelectElement);
  if (!selectedSection) {
    sectionSelectElement.disabled = true;
    actionSelectElement.disabled = true;
    startStopActionButtonElement.disabled = true;
    return;
  }
  selectedSection.actions.forEach(action => {
    const option = document.createElement('option') as HTMLOptionElement;
    option.value = JSON.stringify(action);
    option.text = action.name;
    actionSelectElement.options.add(option);
  });
  actionSelectElement.disabled = actionSelectElement.options.length <= 0;
  startStopActionButtonElement.disabled = true;
  actionSelectElement.selectedIndex = 0;
  actionSelectElement.dispatchEvent(new Event('change'));
});

actionSelectElement.addEventListener('change', () => {
  const selectedAction = getSelectedAction();
  startStopActionButtonElement.disabled = !selectedAction;
});

startStopActionButtonElement.addEventListener('click', (ev) => {
  ev.preventDefault();
  const section = getSelectedSection();
  const action = getSelectedAction();
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

// Sent after window loaded
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
  clearSelectElementOptions(sectionSelectElement);
  viewInfo.sections.forEach(section => {
    const optionElememt = document.createElement('option') as HTMLOptionElement;
    optionElememt.value = JSON.stringify(section);
    optionElememt.text = section.name;
    sectionSelectElement.options.add(optionElememt);
  });
  window.visualCal.resultsManager.load(sessionName);
  sectionSelectElement.disabled = sectionSelectElement.options.length <= 0;
  sectionSelectElement.selectedIndex = 0;
  if (!sectionSelectElement.disabled) sectionSelectElement.dispatchEvent(new Event('change'));
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

window.visualCal.actionManager.on('stateChanged', (info) => {
  runningSectionElement.innerHTML = info.section;
  runningActionElement.innerHTML = info.section;
  switch (info.state) {
    case 'completed':
      procedureStatusElement.innerText = 'Ready';
      runningSectionElement.innerHTML = 'None';
      runningActionElement.innerHTML = 'Completed';
      startStopActionButtonElement.innerHTML = 'Start';
      session.lastSectionName = undefined;
      session.lastActionName = undefined;
      alert('Action completed');
      break;
    case 'started':
      startStopActionButtonElement.innerHTML = 'Stop';
      procedureStatusElement.innerText = 'Running';
      break;
    case 'stopped':
      startStopActionButtonElement.innerHTML = 'Start';
      procedureStatusElement.innerText = 'Stopped';
      runningSectionElement.innerHTML = 'None';
      runningActionElement.innerHTML = 'None';
      session.lastSectionName = undefined;
      session.lastActionName = undefined;
      break;
  }
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

ipcRenderer.on(IpcChannels.session.viewInfo.error, (_, error: Error) => {
  window.visualCal.electron.showErrorDialog(error);
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

ipcRenderer.send(IpcChannels.session.viewInfo.request);
