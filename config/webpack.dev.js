const webpack = require('webpack');
const { merge } = require('webpack-merge');
const paths = require('./paths');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    historyApiFallback: true,
    static: paths.build,
    open: true,
    compress: true,
    hot: true,
    port: 8080,
  },

  plugins: [new webpack.HotModuleReplacementPlugin()],
});
