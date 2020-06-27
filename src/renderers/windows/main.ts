import '../window';
import * as d3 from 'd3';

const loadProcedures = async () => {
  try {
    const procedures = await window.visualCal.procedures.getAll();
      d3.select('#vc-card-procedures-list')
        .data(procedures)
        .append('li')
        .text(d => d.name)
        .enter()
        .append('li')
        .text(d => d.name)
  } catch (error) {
    alert(error.message);
  }
}

window.addEventListener('load', async () => await loadProcedures());
