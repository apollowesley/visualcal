export const IpcChannels = {
  communicationInterface: {
    getStatus: {
      request: 'driver-builder-get-status-request',
      response: 'driver-builder-get-status-response',
      error: 'driver-builder-get-status-error'
    },
    connect: {
      request: 'driver-builder-iface-connect-request',
      response: 'driver-builder-iface-connect-response',
      error: 'driver-builder-iface-connect-error'
    },
    disconnect: {
      request: 'driver-builder-iface-disconnect-request',
      response: 'driver-builder-iface-disconnect-response',
      error: 'driver-builder-iface-disconnect-error'
    },
    write: {
      request: 'driver-builder-iface-write-request',
      response: 'driver-builder-iface-write-response',
      error: 'driver-builder-iface-write-error'
    },
    read: {
      request: 'driver-builder-iface-read-request',
      response: 'driver-builder-iface-read-response',
      error: 'driver-builder-iface-read-error'
    },
    queryString: {
      request: 'driver-builder-iface-query-string-request',
      response: 'driver-builder-iface-query-string-response',
      error: 'driver-builder-iface-query-string-error'
    }
  }
}

export interface Status {
  communicationInterfaceName?: string;
  isConnected: boolean;
}

export interface CommunicationInterfaceActionInfo {
  deviceGpibAddress?: number;
  delayBefore?: number;
  delayAfter?: number;
  terminator?: string;
}

export interface WriteInfo extends CommunicationInterfaceActionInfo {
  data: ArrayBufferLike;
}

export interface QueryStringInfo extends CommunicationInterfaceActionInfo {
  data: string;
}
