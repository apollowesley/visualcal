const path = require('path');

module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@root': path.resolve(__dirname),
      '@common': path.resolve(__dirname, 'src', 'common')
    }
  }
}
