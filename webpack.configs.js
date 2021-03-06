var webpack = require('webpack');
var pkg = require('./package.json')

module.exports = {

  dev: makeConfig({
    hot: true,
    devtool: 'source-map',
    entry: './dev/dev.jsx',
    output: {
      filename: 'bundle.js',
      path: __dirname
    }
  }),

  test: makeConfig({
    devtool: 'inline-source-map',
    loaders: [
      { test: /sinon-chai/, loader: 'imports?define=>false' }
    ]
  })
}


function makeConfig(options){
  var entry = options.entry
    , plugins = options.plugins || []

  var loaders = [
    { test: /\.css$/,  loader: options.extractStyles 
        ? ExtractTextPlugin.extract('style-loader', 'css-loader') 
        : 'style-loader!css-loader' },

    { test: /\.less$/, loader: options.extractStyles  
        ? ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader')  
        : 'style-loader!css-loader!less-loader' },

    { test: /\.gif$/, loader: 'url-loader?mimetype=image/png' },
    { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&minetype=application/font-woff' },
    { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader?name=[name].[ext]' },

    { test: /\.jsx$|\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
  ];

  if (options.hot){
    loaders.splice(loaders.length - 1,0, 
      { test: /\.jsx$|\.js$/, loader: 'react-hot-loader', exclude: /node_modules/ })

    plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin())

    entry = [
      'webpack-dev-server/client?http://localhost:8080',
      'webpack/hot/only-dev-server',
      entry
    ]
  }

  if (options.loaders)
    loaders = loaders.concat(options.loaders)

  if (options.minimize) 
    plugins.push(
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.NoErrorsPlugin())
  else
    plugins.push(
      new webpack.DefinePlugin({ '__VERSION__': JSON.stringify(pkg.version) }));
  
  if ( options.production || options.minimize )
    plugins.push(new webpack.DefinePlugin({
        '__VERSION__': JSON.stringify(pkg.version),
        'process.env': { NODE_ENV: JSON.stringify("production") }
      }))

  if (options.extractStyles)
    plugins.push(
      new ExtractTextPlugin(options.styleName || "styles.css", {
          allChunks: true
      }))

  if (options.banner) {
    plugins.push(
      new webpack.BannerPlugin( 
        'v' + JSON.stringify(pkg.version) + ' | (c) ' + (new Date).getFullYear() + ' Jason Quense | '
        + 'https://github.com/jquense/react-widgets/blob/master/License.txt'
        , { entryOnly : true }))
  }

  return {
    cache: options.cache !== false,
    devtool: options.devtool,
    entry: entry,
    output: options.output,
    externals: options.externals,
    resolve: { extensions: ['', '.js', '.jsx'] },

    module: { loaders: loaders },

    plugins: plugins,

    node: { Buffer: false }
  }
}