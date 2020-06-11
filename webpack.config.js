const path = require('path');

module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@root': path.resolve(__dirname),
      '@shared': path.resolve(__dirname, 'src', 'shared')
    }
  }
}
