/*
    This script must be included in each VisualCal renderer.
    I's included here to support loading the renderers dynamically,
    since Bootstrap Studio doesn't allow for inserting handlebar templates.
*/

// Check if we are in a VisualCal BrowserWindow
if (window.require) {
    // Load the main VisualCal window renderer script.
    // This script contains all of the preload stuff that's needed from here on.
    require('../../dist/renderers/window.js');
    // Listen for the IPC event that has our BrowserWindow.visualCal.id (number)
    window.visualCal.electron.ipc.once('get-visualcal-window-id-res', (_, windowId) => {
        // Determine which VisualCal window we're running in, then load the appropriate script
        switch (windowId) {
            case 0: // main
                require('../../dist/renderers/windows/main.js');
                break;
            // case default:
            //     const errMsg = 'Unknown window id, ' + windowId;
            //     console.error(errMsg);
            //     alert(errMsg);
            case 5: // create procedure
                require('../../dist/renderers/windows/procedure/create.js');
                break;
        }
    });
    window.visualCal.electron.getVisualCalWindowId();
} else {
    // We're in a normal browser
    console.warn('Not running in VisualCal');
}
