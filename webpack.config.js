/**
 * Created by panqianjin on 16/4/11.
 */
var webpack = require('webpack');
var path = require('path') ;
var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');
module.exports = {
    // 单独入口
    // entry: './codesplitting/c1/a.js',
    // 多入口
    /* entry: {
        index:'./codesplitting/c1/a.js',
        other:'./codesplitting/c1/b.js'
    }, */
    // 显示vandor 
    entry: {
        index:'./codesplitting/c1/a.js',
        other:'./codesplitting/c1/b.js',
        vendor:['react'],
        common:['./codesplitting/c1/tool']
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js'
    },
    module: {
        loaders: [{
            test: /\.less$/,
            loader: "style-loader!css-loader!less-loader"
        }]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            names:["common", "vendor"],
            filename: "[name].js"
        })  
    ]
}