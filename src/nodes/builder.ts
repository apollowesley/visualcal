import path from 'path';
import fs, { promises as fsPromises } from 'fs';

interface NodeInfo {
  name: string;
  baseFrontendBuildPath: string;
  baseRuntimeBuildPath: string;
  distBasePath: string;
  editContentPath: string;
  helpContentPath: string;
  htmlScriptContentPath: string;
  htmlTemplatePath: string;
  htmlOutputPath: string;
  runtimeScriptPath: string;
  runtimeOutputPath: string;
}

interface PackageJson {
  'node-red': {
    'nodes': {}
  }
}

const baseDirPath = path.join(__dirname, '..');
const distDirPath = path.join(baseDirPath, 'dist');
const srcNodesDirPath = path.join(baseDirPath, 'src', 'nodes');
const distNodesDirPath = path.join(distDirPath, 'nodes');
const packagejsonPath = path.join(srcNodesDirPath, 'package.json');
const buildDirPath = path.join(baseDirPath, 'nodes-build');
const frontendBuildDirPath = path.join(buildDirPath, 'frontend');
const runtimeBuildDirPath = path.join(buildDirPath, 'runtime');

const getPackageJson = async () => {
  return JSON.parse((await fsPromises.readFile(packagejsonPath)).toString()) as PackageJson;
}

const getNodes = async () => {
  const packageJson = await getPackageJson();
  const nodes: NodeInfo[] = [];
  for (const [_, value] of Object.entries(packageJson['node-red'].nodes)) {
    const nodepath = value as string;
    const nodeName = path.dirname(nodepath);
    const nodeDirExists = fs.existsSync(path.join(srcNodesDirPath, nodeName));
    if (nodeDirExists) {
        nodes.push({
        name: nodeName,
        baseFrontendBuildPath: path.join(frontendBuildDirPath, nodeName),
        baseRuntimeBuildPath: path.join(runtimeBuildDirPath, nodeName),
        distBasePath: path.join(distNodesDirPath, nodeName),
        editContentPath: path.join(srcNodesDirPath, nodeName, 'edit.html'),
        helpContentPath: path.join(srcNodesDirPath, nodeName, 'help.html'),
        htmlScriptContentPath: path.join(frontendBuildDirPath, nodeName, 'frontend.js'),
        htmlTemplatePath: path.join(srcNodesDirPath, nodeName, 'node.html'),
        htmlOutputPath: path.join(distNodesDirPath, nodeName, 'node.html'),
        runtimeScriptPath: path.join(runtimeBuildDirPath, nodeName, 'runtime.js'),
        runtimeOutputPath: path.join(distNodesDirPath, nodeName, 'node.js')
      });
      console.info(`Found node, ${nodeName}`);
    } else {
      throw new Error(`Node, ${nodeName}, is missing its source directory`);
    }
  }
  return nodes;
}

getNodes();
