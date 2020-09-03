import path from 'path';
import fs, { promises as fsPromises } from 'fs';

type NodeRedKeyBindingScope = '*' | 'red-ui-workspace' | 'red-ui-sidebar-node-config';

interface NodeRedToElectronModifierKeyCode {
  nodeRed: string;
  electron: string;
}

interface NodeRedToElectronKeyMap {
  modifiers: NodeRedToElectronModifierKeyCode[];
  keyCodes: NodeRedToElectronModifierKeyCode[];
}

interface NodeSettingsRedKey {
  modifiers: string[];
  keyCodes: string[];
}

interface NodeRedKeyMapScope {
  name: NodeRedKeyBindingScope;
  original: string;
  modifiers: string[];
  keyCodes: string[];
}

interface NodeRedKeyMap {
  scopes: NodeRedKeyMapScope[];
}

interface NodeRedSettingsKeyMap {
  action: string;
  binding: {
    scope: NodeRedKeyBindingScope;
    key: NodeSettingsRedKey;
    user?: boolean;
  };
}

const nodeRedDefaultKeyMapFilePath = path.join(__dirname, 'keymap.json');
const nodeRedKeyMapFilePath = path.join(__dirname, 'node-red-to-electron-keymap.json');
let nodeRedToElectronKeyMap: NodeRedToElectronKeyMap;
let nodeRedDefaultKeyMap: NodeRedKeyMap[];

const readNodeRedDefaultKeyMapFile = async () => {
  const keyMapFileContentsString = (await fsPromises.readFile(nodeRedDefaultKeyMapFilePath)).toString();
  const keyMapFileContents = JSON.parse(keyMapFileContentsString);
  for (const scope in keyMapFileContents) {
    if (Object.hasOwnProperty.call(keyMapFileContents, scope)) {
      const nodeRedScope = keyMapFileContents[scope];
      for (const nodeRedKey in nodeRedScope) {
        if (Object.prototype.hasOwnProperty.call(nodeRedScope, nodeRedKey)) {
          const electronKey = nodeRedScope[nodeRedKey] as string;
          
        }
      }
    }
  }
}

export const init = async () => {
  nodeRedToElectronKeyMap = JSON.parse((await fsPromises.readFile(nodeRedKeyMapFilePath)).toString()) as NodeRedToElectronKeyMap;

}
