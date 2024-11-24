const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/main.js',
  target: 'electron-main',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ]
  },
  plugins: [
    new CleanWebpackPlugin(), // Cleans build folder before each new build
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/databaseCode/database.js', to: 'database.js' },        // Copy database.js
        { from: 'src/databaseCode/database.db', to: 'database.db' },        // Copy database.js
        // { from: 'src/assets/medicalData.db', to: 'assets/' },  // Copy database file if needed
      ],
    }),
  ],
  externals: {
    sqlite3: 'commonjs sqlite3', // Avoid bundling sqlite3 to require it at runtime
  },
  node: {
    __dirname: false,
    __filename: false,
  },
};
