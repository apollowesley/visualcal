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
