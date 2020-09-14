export type CommunicationInterfaceType = 'National Instruments GPIB' | 'Serial Port' | 'Prologix GPIB TCP' | 'Prologix GPIB USB' | 'Emulated';
export type ActionState = 'started' | 'stopped' | 'completed';

export const enum VisualCalWindow {
  Main = 'main',
  Loading = 'loading',
  Login = 'login',
  Console = 'console',
  NodeRedEditor = 'logic-server-editor',
  CreateProcedure = 'create-procedure',
  CreateSession = 'create-session',
  UserInput = 'user-input',
  CreateCommInterface = 'create-comm-interface',
  InteractiveDeviceControl = 'interactive-device-control',
  SelectProcedure = 'select-procedure',
  SelectSession = 'select-session',
  UpdateApp = 'update-app',
  BenchConfigView = 'bench-configurations-view',
  DeviceBeforeWrite = 'device-before-write'
}

export const enum WindowPathType {
  File,
  Url
}


export const CommunicationInterfaceTypes = [
  'National Instruments GPIB',
  'Serial Port',
  'Prologix GPIB TCP',
  'Prologix GPIB USB',
  'Emulated'
];

export const enum CommunicationInterfaceTypesEnum {
  NationalInstrumentsGPIB = 'National Instruments GPIB',
  SerialPort = 'Serial Port',
  PrologixGPIBTCP = 'Prologix GPIB TCP',
  PrologixGPIBUSB = 'Prologix GPIB USB',
  Emulated = 'Emulated'
}

interface IpcChannelRequestResponseErrorNames {
  request: string;
  response: string;
  error: string;
}

export interface IpcChannelCRUD {
  getAll: IpcChannelRequestResponseErrorNames;
  getOne: IpcChannelRequestResponseErrorNames;
  create: IpcChannelRequestResponseErrorNames;
  rename: IpcChannelRequestResponseErrorNames;
  remove: IpcChannelRequestResponseErrorNames;
  update: IpcChannelRequestResponseErrorNames;
  getExists: IpcChannelRequestResponseErrorNames;
  getActive: IpcChannelRequestResponseErrorNames;
  setActive: IpcChannelRequestResponseErrorNames;
}

export const IpcChannels = {
  device: {
    onWrite: 'device-on-write',
    onReadString: 'device-on-read-string',
    beforeWriteString: {
      request: 'device-before-write-string-request',
      response: 'device-before-write-string-response',
      cancel: 'device-before-write-string-cancel',
      error: 'device-before-write-string-error'
    }
  },
  ipc: {
    addRendererEventNames: 'ipc-add-renderer-event-names'
  },
  getDirs: 'get-dirs-request',
  getFiles: 'get-files-request',
  application: {
    quit: {
      request: 'application-quit-request',
      response: 'application-quit-response',
      error: 'application-quit-error'
    },
    quitting: 'application-quitting'
  },
  assets: {
    saveToCurrentProcedure: {
      request: 'assets-save-to-current-procedure-request',
      response: 'assets-save-to-current-procedure-response',
      error: 'assets-save-to-current-procedure-error'
    }
  },
  windows: {
    initialLoadData: 'window-initial-load-data',
    showCreateProcedure: 'show-procedure-create-window',
    showCreateSession: 'show-session-create-window',
    getMyId: {
      request: 'get-visualcal-window-id-request',
      response: 'get-visualcal-window-id-response',
      error: 'get-visualcal-window-id-error'
    },
    show: 'show-window',
    showErrorDialog: 'show-error-dialog',
    showCreateCommIface: 'show-create-comm-iface-window',
    showSaveFileDialog: {
      request: 'show-save-file-dialog-request',
      response: 'show-save-file-dialog-response',
      error: 'show-save-file-dialog-error'
    },
    showOpenFileDialog: {
      request: 'show-open-file-dialog-request',
      response: 'show-open-file-dialog-response',
      error: 'show-open-file-dialog-error'
    },
    showViewSession: 'show-view-session-window'
  },
  log: {
    all: 'log-all',
    result: 'log-result',
    info: 'log-info',
    warn: 'log-warn',
    error: 'log-error'
  },
  autoUpdate: {
    error: 'auto-update-error',
    startedChecking: 'auto-update-started-checking',
    updateAvailable: 'auto-update-available',
    updateNotAvailable: 'auto-update-not-available',
    downloadProgressChanged: 'auto-update-download-progress-changed',
    updateDownloaded: 'auto-update-downloaded',
    downloadAndInstallRequest: 'auto-update-download-and-install-request',
    cancelRequest: 'auto-update-download-and-install-cancel-request'
  },
  communicationInterface: {
    connected: 'communication-interface-connected',
    connecting: 'communication-interface-connecting',
    disconnecting: 'communication-interface-disconnecting',
    disconnected: 'communication-interface-disconnected',
    error: 'communication-interface-error',
    dataReceived: 'communication-interface-data-received',
    stringReceived: 'communication-interface-string-received',
    added: 'communication-interface-added',
    removed: 'communication-interface-removed',
    write: 'communication-interface-write'
  },
  procedures: {
    selectData: 'procedure-select-data',
    cancelSelect: 'cancel-procedure-select',
    cancelCreate: 'cancel-procedure-create',
    getAll: {
      request: 'getAll-procedures-request',
      response: 'getAll-procedures-response',
      error: 'getAll-procedures-error'
    },
    getOne: {
      request: 'getOne-procedures-request',
      response: 'getOne-procedures-response',
      error: 'getOne-procedures-error'
    },
    create: {
      request: 'create-procedure-request',
      response: 'create-procedure-response',
      error: 'create-procedure-error'
    },
    rename: {
      request: 'rename-procedure-request',
      response: 'rename-procedure-response',
      error: 'rename-procedure-error'
    },
    remove: {
      request: 'remove-procedure-request',
      response: 'remove-procedure-response',
      error: 'remove-procedure-error'
    },
    getActive: {
      request: 'get-active-procedure-request',
      response: 'get-active-procedure-response',
      error: 'get-active-procedure-error'
    },
    setActive: {
      request: 'set-active-procedure-request',
      response: 'set-active-procedure-response',
      error: 'set-active-procedure-error'
    },
    getExists: {
      request: 'get-exists-procedure-request',
      response: 'get-exists-procedure-response',
      error: 'get-exists-procedure-error'
    },
    update: {
      request: 'update-procedure-request',
      response: 'update-procedure-response',
      error: 'update-procedure-error'
    }
  },
  session: {
    active: {
      changed: 'session-active-changed'
    },
    setActive: {
      request: 'session-set-active-request',
      response: 'session-set-active-response',
      error: 'session-set-active-error'
    },
    selectData: 'session-select-data',
    cancelSelect: 'cancel-session-select',
    cancelCreate: 'cancel-session-create',
    viewInfo: {
      request: 'session-view-info-request',
      response: 'session-view-info-response',
      error: 'session-view-info-error'
    }, 
    getAll: {
      request: 'getAll-sessions-request',
      response: 'getAll-sessions-response',
      error: 'getAll-sessions-error'
    },
    getAllForActiveUser: {
      request: 'session-get-all-for-active-user-request',
      response: 'session-get-all-for-active-user-response',
      error: 'session-get-all-for-active-user-error'
    },
    getOne: {
      request: 'getOne-sessions-request',
      response: 'getOne-sessions-response',
      error: 'getOne-sessions-error'
    },
    create: {
      request: 'create-session-request',
      response: 'create-session-response',
      error: 'create-session-error'
    },
    rename: {
      request: 'rename-session-request',
      response: 'rename-session-response',
      error: 'rename-session-error'
    },
    remove: {
      request: 'remove-session-request',
      response: 'remove-session-response',
      error: 'remove-session-error'
    },
    getActive: {
      request: 'get-active-session-request',
      response: 'get-active-session-response',
      error: 'get-active-session-error'
    },
    getExists: {
      request: 'get-exists-session-request',
      response: 'get-exists-session-response',
      error: 'get-exists-session-error'
    },
    update: {
      request: 'update-session-request',
      response: 'update-session-response',
      error: 'update-session-error'
    },
    getCommunicationInterfaceTypes: {
      request: 'get-session-communication-interface-types-request',
      response: 'get-session-communication-interface-types-response',
      error: 'get-session-communication-interface-types-error'
    },
    getCommunicationInterfaces: {
      request: 'get-session-communication-interfaces-request',
      response: 'get-session-communication-interfaces-response',
      error: 'get-session-communication-interfaces-error'
    },
    createCommunicationInterface: {
      request: 'create-session-communication-interface-request',
      response: 'create-session-communication-interface-response',
      error: 'create-session-communication-interface-error'
    },
    removeCommunicationInterface: {
      request: 'remove-session-communication-interface-request',
      response: 'remove-session-communication-interface-response',
      error: 'remove-session-communication-interface-error'
    },
    renameCommunicationInterface: {
      request: 'rename-session-communication-interface-request',
      response: 'rename-session-communication-interface-response',
      error: 'rename-session-communication-interface-error'
    },
    updateCommunicationInterface: {
      request: 'update-session-communication-interface-request',
      response: 'update-session-communication-interface-response',
      error: 'update-session-communication-interface-error'
    },
    createCommunicationInterfaceInitialData: 'create-communication-interface-inital-data',
    getDeviceConfigurationNodeInfosForCurrentFlow: {
      request: 'get-device-config-node-infos-for-current-flow-request',
      response: 'get-device-config-node-infos-for-current-flow-response',
      error: 'get-device-config-node-infos-for-current-flow-error'
    }
  },
  results: {
    load: {
      request: 'load-results-request',
      response: 'load-results-response',
      error: 'load-results-error'
    },
    save: {
      request: 'save-results-request',
      response: 'save-results-response',
      error: 'save-results-error'
    },
    saveOne: {
      request: 'saveOne-result-request',
      response: 'saveOne-result-response',
      error: 'saveOne-result-error'
    }
  },
  actions: {
    start: {
      request: 'start-action-request',
      response: 'start-action-response',
      error: 'start-action-error'
    },
    stop: {
      request: 'stop-action-request',
      response: 'stop-action-response',
      error: 'stop-action-error'
    },
    reset: {
      request: 'reset-action-request',
      response: 'reset-action-response',
      error: 'reset-action-error'
    },
    stateChanged: 'start-action-state-changed',
    resultAcquired: 'action-result-acquired'
  },
  user: {
    active: {
      request: 'user-active-request',
      response: 'user-active-response',
      error: 'user-active-error',
      changed: 'user-active-changed',
    },
    login: {
      request: 'user-login-request',
      response: 'user=login-response',
      error: 'user-login-error',
    },
    input: {
      request: 'user-input-request',
      result: 'user-input-result'
    },
    showInput: {
      request: 'user-show-input-request',
      response: 'user-show-input-response',
      error: 'user-show-input-error'
    },
    benchConfig: {
      removeCommInterface: {
        request: 'user-bench-config-remove-comm-interface-request',
        response: 'user-bench-config-remove-comm-interface-response',
        error: 'user-bench-config-remove-comm-interface-error'
      }
    }
  },
  benchConfig: {
    getAllForSession: {
      request: 'bench-config-get-all-for-session-request',
      response: 'bench-config-get-all-for-session-response',
      error: 'bench-config-get-for-session-all-error'
    },
    load: {
      request: 'get-bench-config-request',
      response: 'get-bench-config-response',
      error: 'get-bench-config-error'
    },
    save: {
      request: 'save-bench-config-request',
      response: 'save-bench-config-response',
      error: 'save-bench-config-error'
    },
    createCommsInterface: {
      request: 'bench-config-create-comm-interface-request',
      response: 'bench-config-create-comm-interface-response',
      error: 'bench-config-create-comm-interface-error'
    }
  }
}

export const enum IndySoftNodeTypeNames {
  Procedure = 'procedure-sidebar',
  SectionConfiguration = 'indysoft-section-configuration',
  ActionStart = 'indysoft-action-start',
  DeviceConfiguration = 'indysoft-device-configuration',
  UserInput = 'indysoft-user-input'
}
