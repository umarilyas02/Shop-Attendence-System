const path = require('path');

module.exports = {
  mode: 'production',
  target: 'web', // renderer runs in Chromium context, not Node - Node access goes through preload.js only
  entry: path.join(__dirname, 'src', 'renderer', 'index.jsx'),
  output: {
    path: path.join(__dirname, 'src', 'renderer'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
