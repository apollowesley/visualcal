import * as d3 from 'd3';
import { ipcRenderer } from 'electron';

const getIndySoftImage = () => {
  const image = ipcRenderer.send('get-indysoft-image');
  return image;
}

const indySoftLogo = d3.select('#indysoft-logo');
indySoftLogo.data([90])
  .transition()
  .style('transform', d => `rotate(${d}deg)`)
  .delay(500)
  .duration(2500);
