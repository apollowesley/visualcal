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
import fsPath from 'path';
import { promises as fsPromises } from 'fs';
import { Settings as LogicServerSettings, LibraryType } from '../../../@types/logic-server';
import * as library from './library';

interface NodeRedStorageModule {
  init(settings: LogicServerSettings): Promise<void>;
  getFlows(): Promise<unknown[]>;
  saveFlows(flows: unknown[]): Promise<void>;
  getCredentials(): Promise<[]>;
  saveCredentials(credentials: unknown[]): Promise<void>;
  getSettings(): Promise<unknown>;
  saveSettings(settings: unknown): Promise<unknown>;
  getSessions(): Promise<[]>;
  saveSessions(sessions: unknown[]): Promise<unknown>;
  getLibraryEntry(type: LibraryType, path: string): Promise<unknown>;
  saveLibraryEntry(type: LibraryType, path: string, meta: any, body: unknown): Promise<unknown>;
}

let localSettings: LogicServerSettings;

const getProcedureLogicDirPath = (procedureName: string) => fsPath.join(global.visualCal.dirs.userHomeData.procedures, procedureName, 'logic');
const getProcedureFlowFilePath = (procedureName: string) => fsPath.join(getProcedureLogicDirPath(procedureName), 'flows.json');
const getProcedureCredentialsFilePath = (procedureName: string) => fsPath.join(getProcedureLogicDirPath(procedureName), 'credentials.json');
const getProcedureSettingsFilePath = (procedureName: string) => fsPath.join(getProcedureLogicDirPath(procedureName), 'settings.json');

export const VisualCalLogicServerFileSystem: NodeRedStorageModule = {
    async init(settings: LogicServerSettings): Promise<void> {
      console.debug('VisualCalLogicServerFileSystem.init');
      localSettings = settings;
      const packageFile = fsPath.join(localSettings.userDir, 'package.json');
      await fs.ensureDir(fsPath.join(localSettings.userDir, 'node_modules'));
      await library.init(settings);

      if (!localSettings.readOnly) {
        try {
          fs.statSync(packageFile);
        } catch (err) {
          const defaultPackage = {
            name: 'visualcal-procedure-logic',
            description: 'VisualCal Procedure Logic',
            version: '0.0.1',
            private: true,
          };
          return await fsPromises.writeFile(packageFile, JSON.stringify(defaultPackage));
        }
      }
    },
    async getFlows(): Promise<unknown[]> {
      const currentProcedureName = await global.visualCal.procedureManager.getActive();
      if (!currentProcedureName) return [];
      if (typeof currentProcedureName === 'boolean') throw new Error('No procedure is currently active');
      const filePath = getProcedureFlowFilePath(currentProcedureName);
      if (!fs.existsSync(filePath)) return [];
      const contentString = (await fsPromises.readFile(filePath)).toString();
      const retVal = JSON.parse(contentString);
      return retVal;
    },
    async saveFlows(flows: unknown[]): Promise<void> {
      const currentProcedureName = await global.visualCal.procedureManager.getActive();
      if (!currentProcedureName) return;
      if (typeof currentProcedureName === 'boolean') throw new Error('No procedure is currently active');
      const filePath = getProcedureFlowFilePath(currentProcedureName);
      const contentString = JSON.stringify(flows, null, '\t');
      await fsPromises.writeFile(filePath, contentString);
    },
    async getCredentials(): Promise<[]> {
      const currentProcedureName = await global.visualCal.procedureManager.getActive();
      if (!currentProcedureName) return [];
      if (typeof currentProcedureName === 'boolean') throw new Error('No procedure is currently active');
      const filePath = getProcedureCredentialsFilePath(currentProcedureName);
      if (!fs.existsSync(filePath)) return [];
      const contentString = (await fsPromises.readFile(filePath)).toString();
      const retVal = JSON.parse(contentString);
      return retVal;
    },
    async saveCredentials(credentials: unknown[]): Promise<void> {
      const currentProcedureName = await global.visualCal.procedureManager.getActive();
      if (!currentProcedureName) return;
      if (typeof currentProcedureName === 'boolean') throw new Error('No procedure is currently active');
      const filePath = getProcedureCredentialsFilePath(currentProcedureName);
      const contentString = JSON.stringify(credentials);
      await fsPromises.writeFile(filePath, contentString);
    },
    async getSettings(): Promise<unknown> {
      const currentProcedureName = await global.visualCal.procedureManager.getActive();
      if (!currentProcedureName) return {};
      if (typeof currentProcedureName === 'boolean') throw new Error('No procedure is currently active');
      const filePath = getProcedureSettingsFilePath(currentProcedureName);
      if (!fs.existsSync(filePath)) return {};
      const contentString = (await fsPromises.readFile(filePath)).toString();
      const retVal = JSON.parse(contentString);
      // return retVal.users._;
      return retVal;
    },
    async saveSettings(settings: unknown): Promise<unknown> {
      const currentProcedureName = await global.visualCal.procedureManager.getActive();
      if (!currentProcedureName) return;
      if (typeof currentProcedureName === 'boolean') throw new Error('No procedure is currently active');
      const filePath = getProcedureSettingsFilePath(currentProcedureName);
      if (!fs.existsSync(filePath)) {
        console.error(`${filePath} does not exist`);
        return {};
      }
      let contentString = (await fsPromises.readFile(filePath)).toString();
      // const content = JSON.parse(contentString);
      // content.users._ = settings;
      contentString = JSON.stringify(settings, null, '\t');
      await fsPromises.writeFile(filePath, contentString);
    },
    async getSessions(): Promise<[]> {
      const currentProcedureName = await global.visualCal.procedureManager.getActive();
      if (!currentProcedureName) return [];
      if (typeof currentProcedureName === 'boolean') throw new Error('No procedure is currently active');
      const filePath = getProcedureSettingsFilePath(currentProcedureName);
      if (!fs.existsSync(filePath)) return [];
      const contentString = (await fsPromises.readFile(filePath)).toString();
      const retVal = JSON.parse(contentString);
      return retVal;
    },
    // eslint-disable-next-line
    async saveSessions(sessions: unknown[]): Promise<any> {
      const currentProcedureName = await global.visualCal.procedureManager.getActive();
      if (!currentProcedureName) return;
      if (typeof currentProcedureName === 'boolean') throw new Error('No procedure is currently active');
      const filePath = getProcedureSettingsFilePath(currentProcedureName);
      const contentString = JSON.stringify(sessions);
      await fsPromises.writeFile(filePath, contentString);
    },
    async getLibraryEntry(type: LibraryType, path: string): Promise<unknown> {
      return await library.getLibraryEntry(type, path);
    },
    // async getLibraryEntry(type: LibraryType, path: string): Promise<unknown> {
    //   const filePath = fsPath.join(localSettings.procedureBaseDirPath, global.visualCal.procedureManager.getActive(), 'logic', type, path);
    //   console.debug('VisualCalLogicServerFileSystem.getLibraryEntry', type, path, filePath);
    //   if (!fs.existsSync(filePath)) return {};
    //   const contentString = (await fsPromises.readFile(filePath)).toString();
    //   const retVal = JSON.parse(contentString);
    //   return retVal;
    // }

    // eslint-disable-next-line
    async saveLibraryEntry(type: LibraryType, path: string, meta: object, body: any): Promise<unknown> {
      return await library.saveLibraryEntry(type, path, meta, body);
    }
    // async saveLibraryEntry(type: LibraryType, path: string, meta: object, body: any): Promise<any> {
    //   console.debug('VisualCalLogicServerFileSystem.saveLibraryEntry', type, path, meta, body);
    //   const filePath = fsPath.join(localSettings.procedureBaseDirPath, global.visualCal.procedureManager.getActive(), 'logic', type, path);
    //   const contentString = JSON.stringify({ meta, body });
    //   await fsPromises.writeFile(filePath, contentString);
    // }
    
};
