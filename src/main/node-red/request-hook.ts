import { Express } from 'express';
import path from 'path';
import fs, { promises as fsPromises } from 'fs';
import { isDev } from '../utils/is-dev-mode';

export default (app: Express, apiBasePath = '/red') => {
  const distPath = path.join(global.visualCal.dirs.base, 'dist');
  const srcPath = path.join(global.visualCal.dirs.base, 'src');
  app.get(`${apiBasePath}/visualcal/d3.js`, (_, res) => res.sendFile(path.join(global.visualCal.dirs.base, 'node_modules', 'd3', 'dist', 'd3.min.js')));
  app.get(`${apiBasePath}/renderers/window.js`, (_, res) => res.sendFile(path.join(global.visualCal.dirs.renderers.base, 'window.js')));
  app.get(`${apiBasePath}/renderers/windows/node-red.js`, (_, res) => res.sendFile(path.join(global.visualCal.dirs.renderers.windows, 'node-red.js')));
  app.get(`${apiBasePath}/vue.min.js`, (_, res) => res.sendFile(path.join(global.visualCal.dirs.base, 'node_modules', 'vue', 'dist', 'vue.min.js')));
  app.get('/nodescripts/:nodeType/frontend.js', async (req, res) => {
    const nodeType = req.params.nodeType;
    let file = (await fsPromises.readFile(path.join(global.visualCal.dirs.base, 'dist', 'nodes', `${nodeType}-frontend.js`))).toString('utf-8');
    file = file.replace('Object.defineProperty(exports, "__esModule", { value: true })', '');
    file = file.replace('const js_quantities_1 = __importDefault(require("js-quantities"));', '');
    file = file.replace(`sourceMappingURL=${nodeType}-frontend.js.map`, `/nodescripts/${nodeType}/frontend.js.map`);
    file = file.replace('js_quantities_1', 'Qty');
    return res.send(file);
  });
  app.get('/nodescripts/:nodeType/frontend.js.map', (req, res) => {
    const nodeType = req.params.nodeType;
    return res.sendFile(path.join(global.visualCal.dirs.base, 'dist', 'nodes', nodeType, 'frontend.js.map'));
  });
  // TODO: The follow works to intercept node-red loading, inject a custom index.html and load scripts.  Figure out how to make it useful.  Currently throws exports not defined error.
  app.use((req, res, next) => {
    // Handle files that reference the local file system directory structure
    if (req.url.includes(distPath)) {
      // dist files
      return res.sendFile(req.url);
    } else if (req.url.includes(srcPath)) {
      // src files
      if (isDev()) return res.sendFile(req.url);
      else return res.send('// Not running in development environment');
    }
    // Custom node-red index.html
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
}
