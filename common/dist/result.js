"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpcChannels = void 0;
exports.IpcChannels = {
    getAllBasicInfosForCurrentSession: {
        request: 'getAllBasicInfosForCurrentSession-runs-request',
        response: 'getAllBasicInfosForCurrentSession-runs-response',
        error: 'getAllBasicInfosForCurrentSession-runs-error'
    },
    getResultsForRun: {
        request: 'getResultsForRun-request',
        response: 'getResultsForRun-response',
        error: 'getResultsForRun-error'
    },
    runStarted: 'run-started',
    runStopped: 'run-stopped',
    resultAdded: 'run-result-added'
};
//# sourceMappingURL=result.js.map