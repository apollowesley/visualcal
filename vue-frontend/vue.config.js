/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
  transpileDependencies: [
    "vuetify"
  ],
  publicPath: process.env.NODE_ENV === 'production' ? '/vue' : '',
  outputDir: path.join(__dirname, '..', 'public', 'vue')
}
