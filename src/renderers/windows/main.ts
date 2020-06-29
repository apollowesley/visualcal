import * as d3 from 'd3';

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
    const newProcedures = await window.visualCal.procedureManager.getAll();
    console.info('Got procedures', procedures);
    const areProcListsDifferent = areProcedureListsDifferent(newProcedures);
    if (!areProcListsDifferent) {
      console.info('Procedure lists are not different, aborting update');
      return;
    }
    procedures = newProcedures;
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
  window.visualCal.procedureManager.on('created', async (procedure: ProcedureFile) => {
    console.info('Created', procedure);
    await loadProcedures();
  });
  window.visualCal.procedureManager.on('renamed', async (info: { oldName: string, newName: string }) => {
    console.info('Renamed', info);
    await loadProcedures();
  });
  window.visualCal.procedureManager.on('removed', async (name: string) => {
    console.info('Removed', name);
    await loadProcedures();
  });

  createProcedureButton = document.getElementById('vc-card-procedures-create-button') as HTMLButtonElement;
  createProcedureButton.addEventListener('click', async () => {
    await window.visualCal.electron.showWindow(VisualCalWindow.CreateProcedure);
  });

  await loadProcedures();
}

init();
