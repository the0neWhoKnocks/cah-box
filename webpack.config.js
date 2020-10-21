const { resolve } = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const IgnoreEmitPlugin = require('ignore-emit-webpack-plugin');

const HASH_LENGTH = 5;
const alias = { svelte: resolve('node_modules', 'svelte') };
const extensions = ['.mjs', '.js', '.json', '.svelte', '.html'];
const mainFields = ['svelte', 'module', 'browser', 'main'];
const mode = process.env.NODE_ENV || 'development';
const dev = mode === 'development';

module.exports = {
  devtool: dev && 'source-map',
  entry: {
    'css/global': resolve(__dirname, './src/client/global.styl'),
    'js/home': resolve(__dirname, './src/client/routes/home'),
    'js/room': resolve(__dirname, './src/client/routes/room'),
  },
  mode,
  module: {
    rules: [
      {
        test: /\.styl$/,
        use: [
          MiniCssExtractPlugin.loader,
          // translates CSS into CommonJS
          'css-loader',
          // compiles Stylus to CSS
          'stylus-loader',
        ],
      },
      {
        test: /\.(svelte|html)$/,
        use: {
          loader: 'svelte-loader',
          // Svelte compiler options: https://svelte.dev/docs#svelte_compile
          options: {
            dev,
            emitCss: true,
            hotReload: false // pending https://github.com/sveltejs/svelte/issues/2377
          }
        }
      },
      {
        test: /\.css$/, // For any CSS files that are extracted and inlined by Svelte
        use: [
          MiniCssExtractPlugin.loader,
          // translates CSS into CommonJS
          {
            loader: 'css-loader',
            options: { sourceMap: dev },
          },
        ],
      },
    ]
  },
  optimization: {
    minimizer: [
      new TerserJSPlugin({}),
      new OptimizeCSSAssetsPlugin({}),
    ],
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'initial',
          enforce: true,
          name: 'js/vendor',
          test: /[\\/]node_modules[\\/]/,
        },
      },
    },
  },
  output: {
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info => resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    // assigns the hashed name to the file
    filename: `[name]_[chunkhash:${HASH_LENGTH}].js`,
    path: resolve(__dirname, './dist/public'),
    publicPath: '/',
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        '**/*',
        '!manifest.json', // the watcher won't pick up on changes if this is deleted
        '!audio',
        '!audio/**/*',
        '!imgs',
        '!imgs/**/*',
        '!vendor',
        '!vendor/**/*',
      ],
    }),
    new webpack.DefinePlugin({
      'process.env.WP_BUNDLE': JSON.stringify(true),
    }),
    new MiniCssExtractPlugin({
      filename: `[name]_[chunkhash:${HASH_LENGTH}].css`,
    }),
    /**
     * WP tries to emit the JS files for extracted CSS files, this prevents that
     */
    new IgnoreEmitPlugin(/global.+\.js(\.map)?$/),
    /**
     * Generate a manifest file which contains a mapping of all asset filenames
     * to their corresponding output file so that tools can load them without
     * having to know the hashed name.
     */
    new ManifestPlugin({
      filter: ({ isChunk, isInitial, path }) => {
        return (
          (isChunk && isInitial)
          // ignore Stylus (`global` JS files) & source-map files
          && !/(global.+\.js|\.map)$/.test(path)
        );
      },
      map: (fd) => {
        // strip off preceding directory info, the name is enough
        fd.name = fd.name.split('/').pop();
        return fd;
      },
      writeToFileEmit: true,
    }),
  ],
  resolve: { alias, extensions, mainFields },
  stats: {
    children: false,
    entrypoints: false,
  },
  watch: dev,
};
