const addon = require('../build/Release/indysoft-ni-gpib-native');

interface IndySoftNIGPIB {
  (): string;
}

export = addon.IndysoftNiGpib as IndySoftNIGPIB;
