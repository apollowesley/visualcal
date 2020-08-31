import { Express } from 'express';
import path from 'path';
import fs, { promises as fsPromises } from 'fs';

export default (app: Express, apiBasePath = '/red') => {
  // TODO: The follow works to intercept node-red loading, inject a custom index.html and load scripts.  Figure out how to make it useful.  Currently throws exports not defined error.
  app.use((_, res, next) => {
    const oldSend = res.send;
    (res.send as any) = async function(body?: any) {
      if (body && typeof body === 'string' && body.includes('<title>VisualCal Logic Editor</title>')) {
        body = (await fsPromises.readFile(path.join(global.visualCal.dirs.html.windows, 'node-red.html'))).toString('utf-8');
      }
      res.send = oldSend;
      return res.send(body);
    }
    return next();
  });
  app.use(`${apiBasePath}/visualcal/d3.js`, (_, res) => res.sendFile(path.join(global.visualCal.dirs.base, 'node_modules', 'd3', 'dist', 'd3.min.js')));
  app.use(`${apiBasePath}/renderers/window.js`, (_, res) => res.sendFile(path.join(global.visualCal.dirs.renderers.base, 'window.js')));
  app.use(`${apiBasePath}/renderers/windows/node-red.js`, (_, res) => res.sendFile(path.join(global.visualCal.dirs.renderers.windows, 'node-red.js')));
  app.use(`${apiBasePath}/vue.min.js`, (_, res) => res.sendFile(path.join(global.visualCal.dirs.base, 'node_modules', 'vue', 'dist', 'vue.min.js')));
  app.use('/nodes/scripts/:nodeType/frontend.js', async (req, res) => {
    const nodeType = req.params.nodeType;
    let file = (await fsPromises.readFile(path.join(global.visualCal.dirs.base, 'dist', 'nodes', nodeType, 'frontend.js'))).toString();
    file = file.replace('Object.defineProperty(exports, "__esModule", { value: true })', '');
    file = file.replace('frontend.js.map', `/nodes/scripts/${nodeType}/frontend.js.map`);
    return res.send(file);
  });
  app.use('/nodes/scripts/:nodeType/frontend.js.map', (req, res) => {
    const nodeType = req.params.nodeType;
    return res.sendFile(path.join(global.visualCal.dirs.base, 'dist', 'nodes', nodeType, 'frontend.js.map'));
  });
  app.use('/src/nodes/:nodeType/frontend.ts', (req, res, next) => {
    const nodeType = req.params.nodeType;
    const srcDirExists = fs.existsSync(path.join(global.visualCal.dirs.base, 'src'));
    if (!srcDirExists) return next();
    return res.sendFile(path.join(global.visualCal.dirs.base, 'src', 'nodes', nodeType, 'frontend.ts'));
  });
}
