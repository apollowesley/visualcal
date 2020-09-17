/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
  transpileDependencies: [
    "vuetify"
  ],
  publicPath: process.env.NODE_ENV === 'production' ? '/vue' : '',
  outputDir: path.join(__dirname, '..', 'public', 'vue'),
  devServer: {
    proxy: {
      '/Users/scottpage/Documents/projects/visualcal/dist/renderers/vue/preload.js.map': {
        target: 'http://localhost:18880',
        changeOrigin: true
      },
      '/Users/scottpage/Documents/projects/visualcal/src/renderers/vue/preload.ts': {
        target: 'http://localhost:18880',
        changeOrigin: true
      }
    }
  }
}
