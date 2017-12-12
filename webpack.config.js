const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const plugins = [
  new CleanWebpackPlugin(['dist']),

  new webpack.ProvidePlugin({
    _: 'lodash',
    classnames: 'classnames'
  }),

  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    }
  }),

  new HtmlWebpackPlugin({
    template: './index.html'
  }),

  new CopyWebpackPlugin([
    {from: './server.js'},
  ])
];

module.exports = {
  context: path.resolve(__dirname, 'src'),

  entry: {
    web: './index.js',
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/'
  },

  devServer: {
    contentBase: './dist'
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
              presets: ['env']
            }
          },
          {
            loader: 'eslint-loader',
            options: {
              enforce: 'pre',
              formatter: require('eslint-friendly-formatter')
            }
          }
        ]
      },

      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          outputPath: './img/',
          limit: 100000
        }
      },

      {
        test: /\.(woff|woff2|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          outputPath: './fonts/',
          limit: 100000
        }
      },

      {
        test: /\.(css)$/,
        use: [{
          loader: 'style-loader' // creates style nodes from JS strings
        }, {
          loader: 'css-loader' // translates CSS into CommonJS
        }]
      },

      {
        test: /\.(sass|scss)$/,
        use: [{
          loader: 'style-loader' // creates style nodes from JS strings
        }, {
          loader: 'css-loader' // translates CSS into CommonJS
        }, {
          loader: 'sass-loader' // compiles Sass to CSS
        }]
      }
    ]
  },

  plugins,

  resolve: {
    extensions: ['.js'],
    alias: {
      core: path.resolve(__dirname, 'src/core'),
      components: path.resolve(__dirname, './src/components'),
      img: path.resolve(__dirname, 'img')
    }
  },

  devtool: 'source-map'
};
