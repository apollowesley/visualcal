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

import when from 'when';
import fs from 'fs-extra';
import fspath from 'path';
import { parseJSON, writeFile } from './util';

let globalSettingsFile: string;
let globalSettingsBackup: string;
let settings: any;

export function init(_settings: any) {
  settings = _settings;
  globalSettingsFile = fspath.join(settings.userDir, '.config.json');
  globalSettingsBackup = fspath.join(settings.userDir, '.config.json.backup');
}

export function getSettings(): any {
  return when.promise((resolve, reject) => {
    fs.readFile(globalSettingsFile, 'utf8', (err, data) => {
      if (!err) {
        try {
          return resolve(parseJSON(data));
        } catch (err2) {
          console.trace('Corrupted config detected - resetting');
        }
      }
      return resolve({});
    });
  });
}

export function saveSettings(newSettings: any) {
  if (settings.readOnly) {
    return when.resolve();
  }
  return writeFile(globalSettingsFile, JSON.stringify(newSettings, null, 1), globalSettingsBackup);
}
