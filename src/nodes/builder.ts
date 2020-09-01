import path from 'path';
import fs, { promises as fsPromises } from 'fs';
import mustache from 'mustache';

interface NodeInfo {
  name: string;
  dirName: string;
  baseFrontendBuildPath: string;
  baseRuntimeBuildPath: string;
  htmlEditContentBuildFilePath: string;
  htmlHelpContentBuildFilePath: string;
  htmlScriptContentBuildFilePath: string;
  htmlTemplateBuildPath: string;
  runtimeScriptBuildPath: string;
  outputBaseDirPath: string;
  htmlOutputFilePath: string;
  runtimeOutputFilePath: string;
}

interface NodeTemplate {
  nodeType: string;
  edit: string;
  help: string;
  script: string;
}

interface PackageJson {
  'node-red': {
    'nodes': {}
  }
}

const objectDefinesSearchString = 'Object.defineProperty(exports, "__esModule", { value: true });';
const sourceMapUrlSearchString = 'sourceMappingURL=frontend.js.map';

const baseDirPath = path.join(__dirname, '..');
const srcNodesDirPath = path.join(baseDirPath, 'src', 'nodes');
const packagejsonPath = path.join(srcNodesDirPath, 'package.json');
const buildDirPath = path.join(baseDirPath, 'nodes-build');
const frontendBuildDirPath = path.join(buildDirPath, 'frontend', 'nodes');
const runtimeBuildDirPath = path.join(buildDirPath, 'runtime', 'nodes');
const outputDirPath = path.join(buildDirPath, 'dist', 'nodes');

const isOldNode = (node: NodeInfo) => {
  const htmlEditFileExists = fs.existsSync(node.htmlEditContentBuildFilePath);
  const htmlHelpFileExists = fs.existsSync(node.htmlHelpContentBuildFilePath);
  const htmlScriptFileExists = fs.existsSync(node.htmlScriptContentBuildFilePath);
  const exists = htmlEditFileExists && htmlHelpFileExists && htmlScriptFileExists;
  console.info(node.name, htmlEditFileExists, htmlHelpFileExists, htmlScriptFileExists, exists);
  return !exists;
}

/**
 * Copies a old style node that has not been updated.
 * The node.html and node.js should be the only files that exist there.
 */
const copyOldNode = async (node: NodeInfo) => {
  console.info(`Copying old node, ${node.name}`);
  const nodeBuildDirPath = path.join(runtimeBuildDirPath, node.dirName);
  await fsPromises.copyFile(path.join(srcNodesDirPath, node.dirName, 'node.html'), path.join(node.outputBaseDirPath, 'node.html'));
  await fsPromises.copyFile(path.join(nodeBuildDirPath, 'node.js'), path.join(node.outputBaseDirPath, 'node.js'));
  if (fs.existsSync(path.join(nodeBuildDirPath, 'types.js'))) await fsPromises.copyFile(path.join(nodeBuildDirPath, 'types.js'), path.join(node.outputBaseDirPath, 'types.js'));
}

const buildNode = async (node: NodeInfo) => {
  await fsPromises.mkdir(node.outputBaseDirPath, { recursive: true });
  if (isOldNode(node)) {
    console.info(`Found old node, ${node.name}`);
    await copyOldNode(node);
    return;
  }
  const htmlEditContent = (await fsPromises.readFile(node.htmlEditContentBuildFilePath)).toString();
  const htmlHelpContent = (await fsPromises.readFile(node.htmlHelpContentBuildFilePath)).toString();
  let htmlScriptContent = mustache.render((await fsPromises.readFile(node.htmlScriptContentBuildFilePath)).toString(), { nodeType: node.name });
  htmlScriptContent = htmlScriptContent.replace(sourceMapUrlSearchString, `sourceMappingURL=nodeMaps/${node.dirName}/frontend.js.map`);
  htmlScriptContent = htmlScriptContent.replace(objectDefinesSearchString, '');
  const mainView: NodeTemplate = {
    nodeType: node.name,
    edit: htmlEditContent,
    help: htmlHelpContent,
    script: htmlScriptContent
  }
  const htmlTemplate = (await fsPromises.readFile(node.htmlTemplateBuildPath)).toString();
  const scriptTemplate = (await fsPromises.readFile(node.runtimeScriptBuildPath)).toString();
  const nodeHtmlContent = mustache.render(htmlTemplate, mainView);
  const nodeScriptContent = mustache.render(scriptTemplate, mainView);
  await fsPromises.writeFile(node.htmlOutputFilePath, nodeHtmlContent);
  await fsPromises.writeFile(node.runtimeOutputFilePath, nodeScriptContent);
  await fsPromises.copyFile(path.join(node.baseFrontendBuildPath, 'frontend.js.map'), path.join(node.outputBaseDirPath, 'frontend.js.map'));
  await fsPromises.copyFile(path.join(node.baseRuntimeBuildPath, 'node.js.map'), path.join(node.outputBaseDirPath, 'node.js.map'));
}

const getPackageJson = async () => {
  return JSON.parse((await fsPromises.readFile(packagejsonPath)).toString()) as PackageJson;
}

const build = async () => {
  const packageJson = await getPackageJson();
  for (const [key, value] of Object.entries(packageJson['node-red'].nodes)) {
    const nodepath = value as string;
    const nodeDirName = path.dirname(nodepath);
    const nodeDirExists = fs.existsSync(path.join(srcNodesDirPath, nodeDirName));
    console.info(`Found node, ${nodeDirName}`);
    if (nodeDirExists) {
        await buildNode({
        name: key,
        dirName: nodeDirName,
        baseFrontendBuildPath: path.join(frontendBuildDirPath, nodeDirName),
        baseRuntimeBuildPath: path.join(runtimeBuildDirPath, nodeDirName),
        outputBaseDirPath: path.join(outputDirPath, nodeDirName),
        htmlEditContentBuildFilePath: path.join(srcNodesDirPath, nodeDirName, 'edit.html'),
        htmlHelpContentBuildFilePath: path.join(srcNodesDirPath, nodeDirName, 'help.html'),
        htmlScriptContentBuildFilePath: path.join(frontendBuildDirPath, nodeDirName, 'frontend.js'),
        htmlTemplateBuildPath: path.join(srcNodesDirPath, nodeDirName, 'node.html'),
        htmlOutputFilePath: path.join(outputDirPath, nodeDirName, 'node.html'),
        runtimeScriptBuildPath: path.join(runtimeBuildDirPath, nodeDirName, 'node.js'),
        runtimeOutputFilePath: path.join(outputDirPath, nodeDirName, 'node.js')
      });
    } else {
      throw new Error(`Node, ${nodeDirName}, is missing its source directory`);
    }
  }
  await fsPromises.copyFile(packagejsonPath, path.join(outputDirPath, 'package.json'));
}

const run = async () => {
  try {
    await build();
  } catch (error) {
    console.error(error);
  }
}

run();
