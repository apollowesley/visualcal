import Tabulator from 'tabulator-tables';
import { ipcRenderer } from 'electron';
import { IpcChannels } from '../../../@types/constants';
import { LoadResponseArgs, SaveOneResponseArgs } from '../../managers/RendererResultManager';
import { TriggerOptions } from '../../../main/node-red/utils/actions';
import { SessionViewWindowOpenIPCInfo } from '../../../@types/session-view';

let sessionName: string = '';
let session: Session = { name: '', procedureName: '', username: '', configuration: { devices: [], interfaces: [] } };
let sections: SectionInfo[] = [];
let actions: ActionInfo[] = [];
let results: LogicResult[] = []
let deviceConfigurationNodeInfosForCurrentFlow: DeviceNodeDriverRequirementsInfo[] = [];

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
  const action = selectedRow.getData() as ActionInfo;
}

const startActionIcon = (cell: Tabulator.CellComponent, formatterParams: Tabulator.FormatterParams, onRendered: any) => {
  return '<button>Start</button>';
}

const startActionClick = async (cell: Tabulator.CellComponent) => {
  const section = sectionsTable.getSelectedRows()[0].getData() as SectionInfo;
  const action = cell.getRow().getData() as ActionInfo;
  const opts: TriggerOptions = {
    action: action.name,
    section: section.shortName,
    sessionId: sessionName,
    runId: Date.now().toString(),
    type: 'start'
  };
  window.visualCal.actionManager.trigger(opts);
}

const actionsTable = new Tabulator('#vc-actions-tabulator', {
  data: actions,
  layout: 'fitColumns',
  selectable: 1,
  rowSelected: onActionRowSelected,
  columns: [
    { title: 'Name', field: 'name' },
    { title: 'Start', formatter: startActionIcon, minWidth: 100, hozAlign: 'center', vertAlign: 'middle', cellClick: (_, cell) => startActionClick(cell) }
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
  const deviceInfo = cell.getRow().getData() as DeviceNodeDriverRequirementsInfo;
  const retVal: Tabulator.SelectParams = {
    values: deviceInfo.availableDrivers.map(d => d.displayName)
  };
  return retVal;
}

const devicesTable = new Tabulator('#vc-devices-tabulator', {
  data: deviceConfigurationNodeInfosForCurrentFlow,
  layout: 'fitColumns',
  columns: [
    { title: 'Device Unit Id', field: 'unitId' },
    { title: 'Driver', editor: 'select', editorParams: (cell) => devicesTableGetDrivers(cell) }
  ]
});

const init = () => {
  ipcRenderer.on(IpcChannels.sessions.viewInfo, (_, viewInfo: SessionViewWindowOpenIPCInfo) => {
    sessionName = viewInfo.session.name;
    session = viewInfo.session;
    sections = viewInfo.sections;
    deviceConfigurationNodeInfosForCurrentFlow = viewInfo.deviceConfigurationNodeInfosForCurrentFlow;
    devicesTable.setData(deviceConfigurationNodeInfosForCurrentFlow);
    sectionsTable.setData(sections);
    if (sections.length > 0) {
      const firstSection = sections[0];
      if (firstSection.actions.length > 0) {
        actions = firstSection.actions;
        actionsTable.setData(actions);
      }
    }
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

  window.visualCal.resultsManager.on(IpcChannels.results.saveOne.response, (response: SaveOneResponseArgs) => {
    results.push(response.result);
    resultsTable.setData(results);
  });

  window.visualCal.resultsManager.load(sessionName);
}

init();
