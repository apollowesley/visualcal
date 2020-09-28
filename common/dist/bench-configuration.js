"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationInterfaceTypes = exports.IpcChannels = void 0;
// eslint-disable-next-line
var IpcChannels;
(function (IpcChannels) {
    IpcChannels["GetSerialPortsRequest"] = "get-serial-ports-request";
    IpcChannels["GetSerialPortsResponse"] = "get-serial-ports-response";
    IpcChannels["GetSerialPortsError"] = "get-serial-ports-error";
    IpcChannels["SaveConfigsForCurrentUserRequest"] = "save-bench-configs-for-current-user-request";
    IpcChannels["SaveConfigsForCurrentUserResponse"] = "save-bench-configs-for-current-user-response";
    IpcChannels["SaveConfigsForCurrentUserError"] = "save-bench-configs-for-current-user-error";
    IpcChannels["Updated"] = "bench-configs-for-current-user-updated";
})(IpcChannels = exports.IpcChannels || (exports.IpcChannels = {}));
exports.CommunicationInterfaceTypes = [
    'National Instruments GPIB',
    'Prologix GPIB TCP',
    'Prologix GPIB USB',
    'Serial Port',
    'Emulated'
];
//# sourceMappingURL=bench-configuration.js.map