import * as d3 from 'd3';
import { IpcChannels } from '../../@types/constants';
import { GetAllResponseArgs } from '../managers/RendererProcedureManager';
import { ipcRenderer } from 'electron';

let createProcedureButton: HTMLButtonElement;

let procedures: Procedure[] = [];

const areProcedureListsDifferent = (newProcedures: Procedure[]) => {
  const diff: Procedure[] = [];
  newProcedures.forEach(newProc => {
    const existing = procedures.find(p => p.name === newProc.name);
    if (!existing) diff.push(newProc);
  });
  return diff.length > 0;
}

const loadProcedures = async () => {
  console.info('Loading procedures');
  try {
    await window.visualCal.procedureManager.getAll();
  } catch (error) {
    alert(error.message);
    throw error;
  }
}

const refreshProcedures = async (procedures: Procedure[]) => {
  try {
    console.info('Got procedures', procedures);
    const areProcListsDifferent = areProcedureListsDifferent(procedures);
    if (!areProcListsDifferent) {
      console.info('Procedure lists are not different, aborting update');
      return;
    }
    procedures = procedures;
    const listSelection = d3.select('#vc-card-procedures-list')
    const listItemSelection = listSelection.selectAll('li');
    const data = listItemSelection.data(procedures, (d) => { console.info(d); return (d as Procedure).name; });
    // const updatedListItems = data.append('li').classed('procedure', true).text(d => d.name);
    const enteredListItems = data.enter().append('li').classed('procedure', true).text(d => d.name);
    const exitedListItems = data.exit().remove();
  } catch (error) {
    alert(error.message);
    throw error;
  }
}

const init = async () => {
  ipcRenderer.on(IpcChannels.procedures.create.response, async (_, procedure: CreateProcedureInfo) => {
    console.info('Created', procedure);
    await loadProcedures();
  });
  ipcRenderer.on(IpcChannels.procedures.rename.response, async (_, info: { oldName: string, newName: string }) => {
    console.info('Renamed', info);
    await loadProcedures();
  });
  ipcRenderer.on(IpcChannels.procedures.remove.response, async (_, name: string) => {
    console.info('Removed', name);
    await loadProcedures();
  });
  window.visualCal.procedureManager.on(IpcChannels.procedures.getAll.response, async (response: GetAllResponseArgs) => {
    console.info('GetAll', response.procedures);
    await refreshProcedures(response.procedures);
  });

  createProcedureButton = document.getElementById('vc-card-procedures-create-button') as HTMLButtonElement;
  createProcedureButton.addEventListener('click', async () => {
    await window.visualCal.electron.showWindow(VisualCalWindow.CreateProcedure);
  });

  await loadProcedures();
}

init();
