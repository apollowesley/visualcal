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

let sessionsFile: string;
let settings: any;

export function init(_settings: any) {
  settings = _settings;
  sessionsFile = fspath.join(settings.userDir, '.sessions.json');
}

export function getSessions() {
  return when.promise((resolve) => {
    fs.readFile(sessionsFile, 'utf8', (err: Error, data: string) => {
      if (!err) {
        try {
          return resolve(parseJSON(data));
        } catch (err2) {
          console.trace('Corrupted sessions file - resetting');
        }
      }
      resolve({});
    });
  });
}

export function saveSessions(sessions: string) {
  if (settings.readOnly) {
    return when.resolve();
  }
  return writeFile(sessionsFile, JSON.stringify(sessions));
}
