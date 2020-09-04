import path from 'path';

const getCRUDFilename = (action: string, extension: string, filePrefix?: string) => {
  const filename = `${action}.${extension}`;
  return filePrefix ? `${filePrefix}-${filename}` : filename;
}

const getCRUDDir = (basePath: string, extension: string, filePrefix?: string): VisualCalCRUDDir => {
  return {
    create: path.join(basePath, getCRUDFilename('create', extension, filePrefix)),
    edit: path.join(basePath, getCRUDFilename('edit', extension, filePrefix)),
    remove: path.join(basePath, getCRUDFilename('remove', extension, filePrefix)),
    view: path.join(basePath, getCRUDFilename('view', extension, filePrefix))
  }
}
 
const getCRUDViewDir = (basePath: string, extension: string, filePrefix?: string): VisualCalCRUDViewDir => {
  return {
    create: path.join(basePath, getCRUDFilename('create', extension, filePrefix)),
    edit: path.join(basePath, getCRUDFilename('edit', extension, filePrefix)),
    remove: path.join(basePath, getCRUDFilename('remove', extension, filePrefix)),
    view: path.join(basePath, getCRUDFilename('view', extension, filePrefix))
  }
}

let dirs: VisualCalAugmentDirs;

export const getDirs = () => dirs;

export const init = (appBase: string, userHomeBase: string) => {
  const publicPath = path.join(appBase, 'public');
  const distPath = path.join(appBase, 'dist');
  const bootstrapStudioHtmlPath = path.join(publicPath, 'windows');
  const renderersPath = path.join(distPath, 'renderers');
  const renderersWindowsPath = path.join(renderersPath, 'windows');
  const renderersProcedurePath = path.join(renderersWindowsPath, 'procedure');
  const renderersSessionPath = path.join(renderersWindowsPath, 'session');
  dirs = {
    base: appBase,
    public: publicPath,
    drivers: {
      base: path.join(distPath, 'drivers'),
      communicationInterfaces: path.join(distPath, 'drivers', 'communication-interfaces'),
      devices: path.join(distPath, 'drivers', 'devices')
    },
    html: {
      bootstrapStudio: bootstrapStudioHtmlPath,
      css: path.join(publicPath, 'css'),
      fonts: path.join(publicPath, 'fonts'),
      js: path.join(publicPath, 'js'),
      procedure: getCRUDDir(bootstrapStudioHtmlPath, 'html','procedure'),
      session: getCRUDViewDir(bootstrapStudioHtmlPath, 'html','session'),
      userAction: path.join(bootstrapStudioHtmlPath, 'user-action.html'),
      views: path.join(publicPath, 'views'),
      windows: path.join(publicPath, 'windows'),
      createCommIface: path.join(bootstrapStudioHtmlPath, 'create-comm-iface.html')
    },
    renderers: {
      base: renderersPath,
      views: path.join(renderersPath, 'views'),
      windows: path.join(renderersPath, 'windows'),
      nodeRed: path.join(renderersPath, ' node-red'),
      procedure: getCRUDDir(renderersProcedurePath, 'js'),
      session: getCRUDDir(renderersSessionPath, 'js')
    },
    userHomeData: {
      base: userHomeBase,
      procedures: path.join(userHomeBase, 'procedures'),
      sessions: path.join(userHomeBase, 'sessions')
    }
  }
  return dirs;
}
