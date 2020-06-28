export const IpcChannels = {
  procedures: {
    get: {
      request: 'get-procedures-request',
      response: 'get-procedures-reply',
      error: 'get-procedures-error'
    },
    create: {
      request: 'create-procedure-request',
      response: 'create-procedure-reply',
      error: 'create-procedure-error'
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
