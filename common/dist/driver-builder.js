"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCPIRequiredCommands = exports.IEEE4882MandatedCommands = exports.IpcChannels = void 0;
exports.IpcChannels = {
    communicationInterface: {
        getLibrary: {
            request: 'driver-builder-get-library-request',
            response: 'driver-builder-get-library-response',
            error: 'driver-builder-get-library-error'
        },
        setLibrary: {
            request: 'driver-builder-set-library-request',
            response: 'driver-builder-set-library-response',
            error: 'driver-builder-set-library-error'
        },
        saveDriver: {
            request: 'driver-builder-save-driver-request',
            response: 'driver-builder-save-driver-response',
            error: 'driver-builder-save-driver-error'
        },
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
};
/** Instructions mandated by IEEE 488.2 and SCPI */
exports.IEEE4882MandatedCommands = [
    { name: 'Clear Status Command', type: 'Write', command: '*CLS' },
    { name: 'Standard Event Status Enable Command', type: 'Write', command: '*ESE', parameters: [{ type: 'number', prompt: 'Event status value?', beforeText: ' ' }] },
    { name: 'Standard Event Status Enable Query', type: 'Query', command: '*ESE?', responseDataType: 'Number' },
    { name: 'Standard Event Status Register Query', type: 'Query', command: '*ESR?', responseDataType: 'Number' },
    { name: 'Identification Query', type: 'Query', command: '*IDN?', responseDataType: 'String' },
    { name: 'Operation Complete Command', type: 'Write', command: '*OPC' },
    { name: 'Operation Complete Query', type: 'Query', command: '*OPC?', responseDataType: 'Boolean' },
    { name: 'Reset Command', type: 'Write', command: '*RST' },
    { name: 'Service Request Enable Command', type: 'Write', command: '*SRE', parameters: [{ type: 'number', prompt: 'Service enable value?', beforeText: ' ' }] },
    { name: 'Service Request Enable Query', type: 'Query', command: '*SRE?', responseDataType: 'Number' },
    { name: 'Read Status Byte Query', type: 'Query', command: '*STB?', responseDataType: 'Number' },
    { name: 'Self-Test Query', type: 'Query', command: '*TST?', responseDataType: 'Number' },
    { name: 'Wait-to-Continue Command', type: 'Write', command: '*WAI' }
];
/** Instructions required by SCPI */
exports.SCPIRequiredCommands = [
    { name: 'System Error Query', type: 'Query', command: 'SYSTem:ERRor?', responseDataType: 'String' },
    { name: 'System Version Query', type: 'Query', command: 'SYSTem:VERSion?', responseDataType: 'String' },
    { name: 'Status Operation Event Query', type: 'Query', command: 'STATus:OPERation:EVENt?', responseDataType: 'Number' },
    { name: 'Status Operation Condition Query', type: 'Query', command: 'STATus:OPERation:CONDition?', responseDataType: 'Number' },
    { name: 'Status Operation Enable Command', type: 'Write', command: 'STATus:OPERation:ENABle', parameters: [{ type: 'number', prompt: 'Operation status value?', beforeText: ' ' }] },
    { name: 'Status Operation Enable Query', type: 'Query', command: 'STATus:OPERation:ENABle?', responseDataType: 'Number' },
    { name: 'Status Questionable Event Query', type: 'Query', command: 'STATus:QUEStionable:EVENt?', responseDataType: 'Number' },
    { name: 'Status Questionable Condition Query', type: 'Query', command: 'STATus:QUEStionable:CONDition?', responseDataType: 'Number' },
    { name: 'Status Questionable Enable Command', type: 'Write', command: 'STATus:QUEStionable:ENABle', parameters: [{ type: 'number', prompt: 'Questionable status value?', beforeText: ' ' }] },
    { name: 'Status Questionable Enable Query', type: 'Query', command: 'STATus:QUEStionable:ENABle?', responseDataType: 'Number' },
    { name: 'Status Preset Command', type: 'Write', command: 'STATus:PRESet' }
];
//# sourceMappingURL=driver-builder.js.map