const path = require('path');

module.exports = {
  entry: {
    'service-worker': './src/background/service-worker.js',
    'content-main': './src/content/main.js',
    'inject': './src/content/inject.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  resolve: {
    extensions: ['.js']
  },
  optimization: {
    minimize: false
  }
};
