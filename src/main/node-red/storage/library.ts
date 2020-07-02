/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * */

import fs from 'fs-extra';
import { promises as fsPromises } from 'fs';
import when from 'when';
import fsPath from 'path';
import { writeFile } from './util';
import { Settings as LogicServerSettings } from '../../../@types/logic-server';

let settings: LogicServerSettings;

const getProcedureLogicDirPath = (procedureName: string) => fsPath.join(global.visualCal.dirs.userHomeData.procedures, procedureName, 'logic');
const getProcedureFlowFilePath = (procedureName: string) => fsPath.join(getProcedureLogicDirPath(procedureName), 'flows.json');
const getProcedureCredentialsFilePath = (procedureName: string) => fsPath.join(getProcedureLogicDirPath(procedureName), 'credentials.json');
const getProcedureSettingsFilePath = (procedureName: string) => fsPath.join(getProcedureLogicDirPath(procedureName), 'settings.json');

interface MetaObject {
  // eslint-disable-next-line
  [index: string]: any;
}

function getFileMeta(root: string, path: string): MetaObject {
  const fn = fsPath.join(root, path);
  const fd = fs.openSync(fn, 'r');
  const { size } = fs.fstatSync(fd);
  const meta: MetaObject = {};
  let read = 0;
  const length = 10;
  let remaining = Buffer.alloc(0);
  const buffer = Buffer.alloc(length);
  while (read < size) {
    read += fs.readSync(fd, buffer, 0, length, 0);
    const data = Buffer.concat([remaining, buffer]);
    const index = data.lastIndexOf(0x0a);
    if (index !== -1) {
      const parts = data.slice(0, index).toString().split('\n');
      for (let i = 0; i < parts.length; i++) {
        const match = /^\/\/ (\w+): (.*)/.exec(parts[i]);
        if (match) {
          meta[match[1]] = match[2];
        } else {
          read = size;
          break;
        }
      }
      remaining = data.slice(index + 1);
    } else {
      remaining = data;
    }
  }
  fs.closeSync(fd);
  return meta;
}

function getFileBody(root: string, path: string) {
  let body = '';
  const fn = fsPath.join(root, path);
  const data = fs.readFileSync(fn, 'utf8');
  const parts = data.split('\n');
  let scanning = true;
  for (let i = 0; i < parts.length; i++) {
    if (!/^\/\/ \w+: /.test(parts[i]) || !scanning) {
      body += (body.length > 0 ? '\n' : '') + parts[i];
      scanning = false;
    }
  }
  return body;
}

export async function getLibraryEntry(type: string, path: string): Promise<any> {
  const currentProcedureName = await global.visualCal.procedureManager.getActive();
  if (!currentProcedureName) return [];
  if (typeof currentProcedureName === 'boolean') throw new Error('No procedure is currently active');
  const libDir = getProcedureLogicDirPath(currentProcedureName);
  const root = fsPath.join(libDir, type);
  const rootPath = fsPath.join(libDir, type, path);

  // don't create the folder if it does not exist - we are only reading....
  try {
    const stats = await fsPromises.lstat(rootPath);
    if (stats.isFile()) {
      return getFileBody(root, path);
    }
    if (path.substr(-1) == '/') {
      path = path.substr(0, path.length - 1);
    }
    const fns = await fsPromises.readdir(rootPath);
    const dirs: any[] = [];
    const files: any[] = [];
    fns.sort().filter((fn: string) => {
      const fullPath = fsPath.join(path, fn);
      const absoluteFullPath = fsPath.join(root, fullPath);
      if (fn[0] != '.') {
        const stats2 = fs.lstatSync(absoluteFullPath);
        if (stats2.isDirectory()) {
          dirs.push(fn);
        }
        else {
          const meta = getFileMeta(root, fullPath);
          meta.fn = fn;
          files.push(meta);
        }
      }
    });
    return dirs.concat(files);
  }
  catch (err) {
    // if path is empty, then assume it was a folder, return empty
    if (path === '') {
      return [];
    }
    // if path ends with slash, it was a folder
    // so return empty
    if (path.substr(-1) == '/') {
      return [];
    }
    // else path was specified, but did not exist,
    // check for path.json as an alternative if flows
    if (type === 'flows' && !/\.json$/.test(path)) {
      return getLibraryEntry(type, `${path}.json`)
        .catch((err2) => {
          throw err2;
        });
    }
    throw err;
  }
}

export function init(_settings: LogicServerSettings) {
  settings = _settings;
  return when.resolve();
}

export async function saveLibraryEntry(type: string, path: string, meta: MetaObject, body: string): Promise<any> {
  if (settings.readOnly) {
    return when.resolve();
  }
  const currentProcedureName = await global.visualCal.procedureManager.getActive();
  if (!currentProcedureName) return;
  if (typeof currentProcedureName === 'boolean') throw new Error('No procedure is currently active');
  const libDir = getProcedureLogicDirPath(currentProcedureName);
  if (type === 'flows' && !path.endsWith('.json')) {
    path += '.json';
  }
  const fn = fsPath.join(libDir, type, path);
  let headers = '';
  for (const i in meta) {
    if (Object.prototype.hasOwnProperty.call(meta, i)) {
      headers += `// ${i}: ${meta[i]}\n`;
    }
  }
  if (type === 'flows' && settings.flowFilePretty) {
    body = JSON.stringify(JSON.parse(body), null, 4);
  }
  return fs.ensureDir(fsPath.dirname(fn)).then(() => {
    writeFile(fn, headers + body);
  });
}
