"use strict";
exports.__esModule = true;
exports.test = void 0;
var electron_1 = require("electron");
exports.test = function (msg) { return alert(msg); };
window.visualCal = {
    log: {
        result: function (result) {
            electron_1.ipcRenderer.send('node-red', result);
        }
    }
};
//# sourceMappingURL=NodeRed.js.map