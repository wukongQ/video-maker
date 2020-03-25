const path = require('path')
const Base = require('./base.js')
const merge = require('webpack-merge')

module.exports = merge(Base, {
  mode: 'development',
  devtool: 'eval-source-map',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'js/[hash]_bundle.js',
    publicPath: '/'
  },
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, '../src/components'),
      '@routes': path.resolve(__dirname, '../src/routes'),
      '@utils': path.resolve(__dirname, '../src/utils'),
      '@hooks': path.resolve(__dirname, '../src/hooks')
    }
  },
  devServer: {
    host: 'localhost',
    port: 8181,
    open: true,
    hotOnly: true,
    inline: true,
    historyApiFallback: true,
    proxy: {}
  }
})
