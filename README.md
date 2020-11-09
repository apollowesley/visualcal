# IndySoft VisualCal

[![platform](https://img.shields.io/badge/platform-electron-blue)](https://www.electronjs.org/)
[![Board Status](https://dev.azure.com/indysoftdev/d5a41c3a-c00e-474f-8523-6e3b0ad8aa05/40526240-97f1-4338-b1fe-709993a34595/_apis/work/boardbadge/fa9fe169-5c9b-427a-acbe-829c8f6ce1ff?columnOptions=1)](https://dev.azure.com/indysoftdev/d5a41c3a-c00e-474f-8523-6e3b0ad8aa05/_boards/board/t/40526240-97f1-4338-b1fe-709993a34595/Microsoft.EpicCategory/)
[![Build Status](https://dev.azure.com/indysoftdev/VisualCal/_apis/build/status/production/production?branchName=production)](https://dev.azure.com/indysoftdev/VisualCal/_build/latest?definitionId=15&branchName=production)

## How to set up for development

- Open main ```visualcal``` directory in VSCode Insiders
- Open ```visualcal/frontend-vue``` directory in another VSCode Insiders window
- Update ```visualcal/src``` files for the main Electron app
- Update ```visualcal/frontend-vue``` files for the Vue.js app
- The frontend-vue app can be run in dev mode, and the main app is coded to accomidate running it that way
- In the VisualCal main window, open the Vue Test Window from the Development menu
- To build, first build the frontend-vue app so the files end up in ```visualcal/public/vue```, then deploy as usual since the public directory and it's contents are included during publish
- Set PKG_CONFIG_PATH environment variable to the Mono Framework install location for Edge (i.e. ```export PKG_CONFIG_PATH=/Library/Frameworks/Mono.framework/Versions/6.12.0/lib/pkgconfig/``` on Mac)

*** NOTE: THE ABOVE DOCUMENT HAS NOT BEEN TESTED WITH PUBLISH ***
