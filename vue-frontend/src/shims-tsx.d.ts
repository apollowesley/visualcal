import Vue, { VNode } from 'vue'
import { ipcRenderer } from 'electron';
import { Ipc } from '@/utils/Ipc';

declare global {

  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }

  interface Window {
    electron: {
      ipcRenderer: typeof ipcRenderer
    };
    ipc: Ipc
  }

}
