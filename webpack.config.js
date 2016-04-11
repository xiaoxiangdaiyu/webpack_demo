/**
 * Created by panqianjin on 16/4/11.
 */
var webpack = require('webpack');
var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');
module.exports = {
    entry: './js/index',
    output: {
        path: __dirname,
        filename: '/dist/index.js'
    },
    module: {
        loaders: [{
            test: /\.less$/,
            loader: "style-loader!css-loader!less-loader"
        }]
    }
}