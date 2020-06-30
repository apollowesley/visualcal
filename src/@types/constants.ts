export const DemoUser: User = {
  email: 'test@example.com',
  nameFirst: 'Test',
  nameLast: 'User'
}

export interface IpcChannelRequestResponseErrorNames {
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
  log: {
    result: 'log-result',
    info: 'log-info',
    warn: 'log-warn',
    error: 'log-error'
  },
  procedures: {
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
  sessions: {
    getAll: {
      request: 'getAll-sessions-request',
      response: 'getAll-sessions-response',
      error: 'getAll-sessions-error'
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
    setActive: {
      request: 'set-active-session-request',
      response: 'set-active-session-response',
      error: 'set-active-session-error'
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
    }
  }
}

export const enum IndySoftNodeTypeNames {
  Procedure = 'procedure-sidebar',
  SectionConfiguration = 'indysoft-section-configuration',
  ActionStart = 'indysoft-action-start',
  DeviceConfiguration = 'indysoft-device-configuration'
}

export const enum EventNames {
  ERROR = 'ERROR',
  TRIGGER_ACTION = 'TRIGGER_ACTION',
  ACTION_STATE = 'ACTION_STATE',
  RESET_ACTION = 'RESET_ACTION',
  INSTRUCTION = 'INSTRUCTION',
  USER_INPUT = 'USER_INPUT',
  SERVER_STATUS = 'SERVER_STATUS',
  RESULT = 'RESULT'
}
