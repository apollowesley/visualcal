/*
    This script must be included in each VisualCal renderer.
    It's included here to support loading the renderers dynamically,
    since Bootstrap Studio doesn't allow for inserting handlebar templates.
*/

// Check if we are in a VisualCal BrowserWindow
if (window.require) {
    // Load the main VisualCal window renderer script.
    // This script contains all of the preload stuff that's needed from here on.
    require('../../dist/renderers/window.js');
    // Listen for the IPC event that has our BrowserWindow.visualCal.id (number)
    window.visualCal.electron.ipc.once('get-visualcal-window-id-response', (_, windowId) => {
        // Determine which VisualCal window we're running in, then load the appropriate script
        console.info(`Current window Id: ${windowId}`);
        switch (windowId) {
            case 0: // main
                require('../../dist/renderers/windows/main.js');
                break;
            case 2: // Login
                require('../../dist/renderers/windows/login.js');
                break;
            case 5: // create procedure
                require('../../dist/renderers/windows/procedure/create.js');
                break;
            case 6: // create session
                require('../../dist/renderers/windows/session/create.js');
                break;
            case 7: // view session
                require('../../dist/renderers/windows/session/view.js');
                break;
            case 8: // user instruction
                require('../../dist/renderers/windows/user/action.js');
                break;
            case 9: // user input
                require('../../dist/renderers/windows/user/action.js');
                break;
            case 10: // create communication interface
                require('../../dist/renderers/windows/session/create-comm-iface.js');
                break;
            case 12: // select procedure
                require('../../dist/renderers/windows/procedure/select.js');
                break;
            case 13: // update app
                require('../../dist/renderers/windows/update-app.js');
                break;
        }
    });
    window.visualCal.electron.getVisualCalWindowId();
} else {
    // We're in a normal browser
    console.warn('Not running in VisualCal');
}
