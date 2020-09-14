/*
    This script must be included in each VisualCal renderer.
    It's included here to support loading the renderers dynamically,
    since Bootstrap Studio doesn't allow for inserting handlebar templates.
*/

// Main = 'main',
// Loading = 'loading',
// Login = 'login',
// Console = 'console',
// NodeRedEditor = 'node-red-editor',
// CreateProcedure = 'create-procedure',
// CreateSession = 'create-session',
// ViewSession = 'view-session',
// UserInput = 'user-input',
// CreateCommInterface = 'create-comm-interface',
// InteractiveDeviceControl = 'interactive-device-control',
// SelectProcedure = 'select-procedure',
// UpdateApp = 'update-app'

// Check if we are in a VisualCal BrowserWindow
if (window.require) {
    // Load the main VisualCal window renderer script.
    // This script contains all of the preload stuff that's needed from here on.
    require('../../dist/renderers/window.js');
    // Listen for the IPC event that has our BrowserWindow.visualCal.id (number)
    window.visualCal.electron.ipc.once('get-visualcal-window-id-response', (_, windowId) => {
        window.visualCal.windowId = windowId;
        window.dispatchEvent(new Event('windowIdSet'));
        // Determine which VisualCal window we're running in, then load the appropriate script
        console.info(`Current window Id: ${windowId}`);
        switch (windowId) {
            case 'main': // main
                require('../../dist/renderers/windows/session/view/index.js');
                break;
            case 'login': // Login
                require('../../dist/renderers/windows/login.js');
                break;
            case 'create-procedure': // create procedure
                require('../../dist/renderers/windows/procedure/create.js');
                break;
            case 'create-session': // create session
                require('../../dist/renderers/windows/session/create.js');
                break;
            case 'user-input': // user input
                require('../../dist/renderers/windows/user/action.js');
                break;
            case 'create-comm-interface': // create communication interface
                require('../../dist/renderers/windows/session/create-comm-iface.js');
                break;
            case 'select-procedure': // select procedure
                require('../../dist/renderers/windows/procedure/select.js');
                break;
            case 'select-session': // select procedure
                require('../../dist/renderers/windows/session/select.js');
                break;
            case 'update-app': // update app
                require('../../dist/renderers/windows/update-app.js');
                break;
            case 'bench-configurations-view':
                require('../../dist/renderers/windows/bench-config/view/index.js');
                break;
            case 'device-before-write':
                require('../../dist/renderers/windows/device-before-write.js');
                break;
        }
        window.dispatchEvent(new Event('visualCalBootstrapLoaded'));
    });
    window.visualCal.electron.getVisualCalWindowId();
} else {
    // We're in a normal browser
    throw new Error('Not running in VisualCal');
}
