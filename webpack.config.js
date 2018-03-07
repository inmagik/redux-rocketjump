const path = require('path')

module.exports = {
  entry: './example/index.js',
  'mode': 'development',
  devServer: {
    contentBase: './example',
    historyApiFallback: {
      index: 'index.html'
    }
  },
  output: {
    filename: 'bundle.js'
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
      'redux-rocketjump': path.resolve(__dirname, 'src'),
    }
  }
};
