const webpack = require('webpack');
const resolve = require('path').resolve;

const config = {
 devtool: 'eval-source-map',
 entry: __dirname + '/js/index.jsx',
 output: {
  path: resolve('../public'),
  filename: 'bundle.js',
  publicPath: resolve('../public')
 },
 resolve: {
  extensions: ['.js', '.jsx', '.json', '.css']
 },
 module: {
  rules: [
   {
    test: /\.jsx?$/,   // <-- added $ anchor to prevent matching .json
    exclude: modulePath =>
      /\.json$/.test(modulePath) ||   // <-- exclude JSON files
      (/node_modules/.test(modulePath) &&
      !/node_modules[\\/](firebase|@firebase)/.test(modulePath)),
    use: {
     loader: 'babel-loader',
     options: {
      presets: [
       '@babel/preset-env',
       '@babel/preset-react'
      ],
      plugins: [
       '@babel/plugin-proposal-optional-chaining',
       '@babel/plugin-proposal-nullish-coalescing-operator'
      ]
     }
    }
   },
   {
    test: /\.css$/,
    loader: 'style-loader!css-loader?modules'
   },
   {
    test: /\.json$/,
    type: 'json',
   },
  ]
 }
};
module.exports = config;