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
    port: 9000,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      }
    ]
  },
  resolve: {
    alias: {
      'redux-rocketjump': path.resolve(__dirname, './src'),
    }
  }
};
