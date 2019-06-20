const path = require('path')

module.exports = {
  entry: './index.js',
  mode: 'development',
  output: {
    filename: 'bundle.js'
  },
  devServer: {
    historyApiFallback: true,
    port: 9000,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      }
    ]
  },
  resolve: {
    alias: {
      'redux-rocketjump': path.resolve(__dirname, '../src'),
    }
  }
};
