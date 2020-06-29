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

import fs, { PathLike } from 'fs-extra';
import fspath from 'path';
import when from 'when';

export function parseJSON(data: string) {
  if (data.charCodeAt(0) === 0xFEFF) {
    data = data.slice(1);
  }
  return JSON.parse(data);
}

export interface ReadFileResolve {
    (value: string | string[]): void;
}

export function readFile(path: string, backupPath: string, emptyResponse: any, type: string): When.Promise<string | string[]> {
  return when.promise((resolve: ReadFileResolve): void => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (!err) {
        if (data.length === 0) {
          console.warn('storage.localfilesystem.empty', { type });
          try {
            const backupStat = fs.statSync(backupPath);
            if (backupStat.size === 0) {
              // Empty flows, empty backup - return empty flow
              return resolve(emptyResponse);
            }
            // Empty flows, restore backup
            console.warn('storage.localfilesystem.restore', { path: backupPath, type });
            fs.copy(backupPath, path, (backupCopyErr) => {
              if (backupCopyErr) {
                // Restore backup failed
                console.warn('storage.localfilesystem.restore-fail', { message: backupCopyErr.toString(), type });
                resolve([]);
              } else {
                // Loop back in to load the restored backup
                return readFile(path, backupPath, emptyResponse, type);
              }
            });
            return;
          } catch (backupStatErr) {
            // Empty flow file, no back-up file
            return resolve(emptyResponse);
          }
        }
        try {
          return resolve(parseJSON(data));
        } catch (parseErr) {
          console.warn('storage.localfilesystem.invalid', { type });
          return resolve(emptyResponse);
        }
      } else {
        if (type === 'flow') {
          console.info('storage.localfilesystem.create', { type });
        }
        resolve(emptyResponse);
      }
    });
  });
}

/**
 * Write content to a file using UTF8 encoding.
 * This forces a fsync before completing to ensure
 * the write hits disk.
 */
export function writeFile(path: PathLike, content: any, backupPath?: PathLike): When.Promise<void> {
  if (backupPath) {
    if (fs.existsSync(path)) {
      fs.renameSync(path, backupPath);
    }
  }
  return when.promise((resolve, reject) => {
    fs.ensureDir(fspath.dirname(path.toString()), undefined, (err) => {
      if (err) {
        reject(err);
        return;
      }
      const stream = fs.createWriteStream(path);
      stream.on('open', (fd) => {
        stream.write(content, 'utf8', () => {
          fs.fsync(fd, (err) => {
            if (err) {
              console.warn('storage.localfilesystem.fsync-fail', { path, message: err.toString() });
            }
            stream.end(resolve);
          });
        });
      });
      stream.on('error', (err) => {
        reject(err);
      });
    });
  });
}
