import * as d3 from 'd3';

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
    const newProcedures = await global.visualCal.procedureManager.getAll();
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
  global.visualCal.procedureManager.on('created', async (procedure: ProcedureFile) => {
    console.info('Created', procedure);
    await loadProcedures();
  });
  global.visualCal.procedureManager.on('renamed', async (info: { oldName: string, newName: string }) => {
    console.info('Renamed', info);
    await loadProcedures();
  });
  global.visualCal.procedureManager.on('removed', async (name: string) => {
    console.info('Removed', name);
    await loadProcedures();
  });
  global.visualCal.procedureManager.on('updated', async (procedure: ProcedureFile) => {
    console.info('Updated', procedure);
    await loadProcedures();
  });
  await loadProcedures();
}

init();
