"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpcChannels = void 0;
exports.IpcChannels = {
    communicationInterface: {
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
};
//# sourceMappingURL=driver-builder.js.map