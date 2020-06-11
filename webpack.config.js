const path = require('path');

module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@root': path.resolve(__dirname),
      '@menu': path.resolve(__dirname, 'src', 'menu'),
      '@shared': path.resolve(__dirname, 'src', 'shared')
    }
  }
}
