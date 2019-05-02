const path = require('path')

module.exports = {
  entry: './example/index.js',
  mode: 'development',
  output: {
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: './example',
    historyApiFallback: true,
    port: 3000,
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
      'redux-rocketjump': path.resolve(__dirname, 'packages/redux-rocketjump/src'),
      'react-rocketjump': path.resolve(__dirname, 'packages/react-rocketjump/src'),
    }
  }
};
