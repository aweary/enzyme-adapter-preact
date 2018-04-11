const { readFileSync } = require('fs');
const path = require('path');
const babelSettings = JSON.parse(readFileSync('.babelrc'));
const webpack = require('webpack');

module.exports = {
  entry: [path.resolve(__dirname, './src/index.js')],
  output: {
    path: path.resolve(__dirname, './lib'),
    filename: 'index.js'
  },
  externals: {
    enzyme: 'enzyme',
    'enzyme-adapter-utils': 'enzyme-adapter-utils',
    preact: 'preact',
    react: 'react',
    'react-test-renderer/shallow': 'react-test-renderer/shallow'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          query: babelSettings
        }
      }
    ]
  },
  plugins: [new webpack.optimize.OccurrenceOrderPlugin()]
};
