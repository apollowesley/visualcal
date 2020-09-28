"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpcChannels = void 0;
var IpcChannels;
(function (IpcChannels) {
    IpcChannels["Error"] = "auto-update-error";
    IpcChannels["StartedChecking"] = "auto-update-started-checking";
    IpcChannels["UpdateAvailable"] = "auto-update-available";
    IpcChannels["UpdateNotAvailable"] = "auto-update-not-available";
    IpcChannels["DownloadProgressChanged"] = "auto-update-download-progress-changed";
    IpcChannels["UpdateDownloaded"] = "auto-update-downloaded";
    IpcChannels["DownloadAndInstallRequest"] = "auto-update-download-and-install-request";
    IpcChannels["CancelRequest"] = "auto-update-download-and-install-cancel-request";
})(IpcChannels = exports.IpcChannels || (exports.IpcChannels = {}));
//# sourceMappingURL=auto-update.js.map