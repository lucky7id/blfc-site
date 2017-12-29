const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const eslintFormater = require('eslint-friendly-formatter');

const plugins = [
  new CleanWebpackPlugin(['dist']),

  new webpack.ProvidePlugin({
    _: 'lodash',
    classnames: 'classnames',
  }),

  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    },
  }),

  new HtmlWebpackPlugin({
    template: './index.html',
  }),

  new CopyWebpackPlugin([
    { from: './server.js' },
  ]),

  new CopyWebpackPlugin([
    { from: './img', to: 'img'},
  ]),
];

module.exports = {
  context: path.resolve(__dirname, 'src'),

  entry: {
    web: './index.js',
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/blfc',
  },

  devServer: {
    contentBase: './dist',
    publicPath: '/blfc',
    openPage: 'blfc',
  },

  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: [/node_modules/, path.resolve(__dirname, 'dist')],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['env'],
            },
          },
          {
            loader: 'eslint-loader',
            options: {
              enforce: 'pre',
              formatter: eslintFormater,
            },
          },
        ],
      },

      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          outputPath: './img/',
          limit: 100000,
        },
      },

      {
        test: /\.(woff|woff2|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          outputPath: './fonts/',
          limit: 100000,
        },
      },

      {
        test: /\.(css)$/,
        use: [{
          loader: 'style-loader', // creates style nodes from JS strings
        }, {
          loader: 'css-loader', // translates CSS into CommonJS
        }],
      },

      {
        test: /\.(sass|scss)$/,
        use: [{
          loader: 'style-loader', // creates style nodes from JS strings
        }, {
          loader: 'css-loader', // translates CSS into CommonJS
        }, {
          loader: 'sass-loader', // compiles Sass to CSS
        }],
      },
    ],
  },

  plugins,

  resolve: {
    extensions: ['.js'],
  },

  devtool: 'source-map',
};
