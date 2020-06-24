// ***** HOW TO USE *****
// Place the following in package.json in build electron-builder build object
// "afterSign": "scripts/notarize.js",

// require('dotenv').config();
// const { notarize } = require('electron-notarize');

// exports.default = async function notarizing(context) {
//   const { electronPlatformName, appOutDir } = context;  
//   if (electronPlatformName !== 'darwin') {
//     return;
//   }

//   const appName = context.packager.appInfo.productFilename;

//   return await notarize({
//     appBundleId: 'com.indysoft.visualcal',
//     appPath: `${appOutDir}/${appName}.app`,
//     appleId: process.env.APPLEID,
//     appleIdPassword: process.env.APPLEIDPASS,
//   });
// };

// See: https://medium.com/@TwitterArchiveEraser/notarize-electron-apps-7a5f988406db

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
var electron_notarize = require('electron-notarize');

console.info(fs.existsSync(process.env.CSC_LINK));
module.exports = async function (params) {
    // Only notarize the app on Mac OS only.
    if (process.platform !== 'darwin') {
        return;
    }
    console.log('afterSign hook triggered', params);

    // Same appId in electron-builder.
    let appId = 'com.indysoft.visualcal'

    let appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);
    if (!fs.existsSync(appPath)) {
        throw new Error(`Cannot find application at: ${appPath}`);
    }

    console.log(`Notarizing ${appId} found at ${appPath}`);

    try {
        await electron_notarize.notarize({
            appBundleId: appId,
            appPath: appPath,
            appleId: process.env.APPLEID,
            appleIdPassword: process.env.APPLEIDPASS
        });
    } catch (error) {
        console.error(error);
        console.log('Last error was caught and should not stop the build process.');
    }

    console.log(`Done notarizing ${appId}`);
};
