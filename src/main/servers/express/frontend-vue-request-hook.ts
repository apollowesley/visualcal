import express from 'express';
import path from 'path';
import { promises as fsPromises } from 'fs';

export const hook = (app: express.Express) => {
  const distRenderersVuePath = path.join(global.visualCal.dirs.renderers.base, 'vue');
  const srcRenderersVuePath = path.join(global.visualCal.dirs.base, 'src', 'renderers', 'vue');

  // TODO: Reorg code so express is standalone and the rest of the app uses it, instead of having this be in node-red dir
  app.use('/vue', express.static(path.join(global.visualCal.dirs.public, 'vue'))); // Vue.js app

  app.use(`${distRenderersVuePath}/:fileName`, async (req, res) => { // Vue.js app TS maps
    // path.join(__dirname, '..', '..', 'dist', 'renderers', 'vue'), express.static(path.join(global.visualCal.dirs.renderers.base, 'vue'))
    const fileName = req.params.fileName;
    const filePath = path.join(distRenderersVuePath, fileName);
    let fileContents = (await fsPromises.readFile(filePath)).toString();
    fileContents = fileContents.replace('../../../src/renderers/vue', 'vue/src-maps');
    return res.send(fileContents);
  });

  app.use(`${srcRenderersVuePath}/:fileName`, (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(srcRenderersVuePath, fileName);
    return res.send(filePath);
  });
}
