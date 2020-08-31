import { Express } from 'express';
import path from 'path';
import { promises as fsPromises } from 'fs';

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
}
