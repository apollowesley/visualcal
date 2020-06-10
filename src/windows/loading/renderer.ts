import * as d3 from 'd3';
import { ipcRenderer } from 'electron';

const getIndySoftImage = () => {
  const image = ipcRenderer.send('get-indysoft-image');
  return image;
}

const animate = () => {

  const height = Number(window.innerHeight);
  const width = Number(window.innerWidth);

  function indySoftLogoTransformTween() {
    const i = d3.interpolate(1, 360);
    return function(t: any) {
      return `translate(0, -20) scale(${i(t) / 360}) rotate(${i(t)})`;
    };
  };

  function visualCalLogoTransformTween() {
    const i = d3.interpolate(-250, 0);
    return function(t: any) {
      return `translate(${i(t)}, 40)`;
    };
  };

  d3.select('#indysoft-group')
    .attr('transform', 'translate(0, -20) scale(0) rotate(1)')
    .transition()
    .duration(1800)
    .attrTween('transform', indySoftLogoTransformTween);

  d3.select('#visualcal-group')
    .attr('transform', 'translate(-250 40)')
    .transition()
    .delay(2000)
    .duration(1000)
    .attrTween('transform', visualCalLogoTransformTween);
}

window.addEventListener('load', animate);
