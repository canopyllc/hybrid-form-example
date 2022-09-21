const webpack = require('webpack'),
      path = require('path'),
      glob = require('glob'),
      {VueLoaderPlugin} = require('vue-loader'),
      LiveReloadPlugin = require('webpack-livereload-plugin'),
      MiniCssExtractPlugin = require('mini-css-extract-plugin'),
      StylelintPlugin = require('stylelint-webpack-plugin'),
      ESLintPlugin = require('eslint-webpack-plugin'),
      isDevMode = process.env.NODE_ENV === 'development',
      paths = {
        jsFiles: glob.sync('./src/js/bundles/**/*.js'),
        outputDir: path.join(__dirname, 'public/static/dist/'),
      };

module.exports = {
  context: __dirname,
  mode: isDevMode ? 'development' : 'production',
  entry: paths.jsFiles.reduce((entries, filepath) => ({
    ...entries,
    [filepath.replace(/^\.\/src\/js\/bundles/, '').replace('.js', '')]: filepath,
  }), {}),
  output: {
    path: paths.outputDir,
    filename: 'js[name].min.js',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(s)?css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              url: false,
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new LiveReloadPlugin(),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // all options are optional
      filename: 'css[name].min.css',
      chunkFilename: 'css[id].min.css',
      ignoreOrder: false, // Enable to remove warnings about conflicting order
    }),
    new StylelintPlugin({
      context: 'src/scss',
      fix: true,
    }),
    new ESLintPlugin({
      extensions: ['js', 'vue'],
    }),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    }),
  ],
  // Necessary for file changes inside docker node volume to get picked up
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
      pinia: 'pinia/dist/pinia.esm-browser.js',
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.vue', '.scss'],
  },
};
