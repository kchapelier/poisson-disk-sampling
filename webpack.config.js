const path = require('path');
const glob = require('glob');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, options) => ({
  mode: 'production',
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: false,
        test: /\.min\.js(\?.*)?$/i,
      })
    ]
  },
  entry: {
    'poisson': './src/poisson-disk-sampling.js',
    'poisson.min': './src/poisson-disk-sampling.js'
  },
  output: {
    filename: '[name].js',
    library: "Poisson",
    libraryTarget: 'umd',
    path: path.resolve(__dirname, './build')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
});
