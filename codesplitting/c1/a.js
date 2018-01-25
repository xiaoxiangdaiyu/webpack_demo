var react = require('react')
var tool = require('./tool')
// var b = require('./b')
function load(){
    // b()
    tool()
    console.log('全部文件都从一个入口打包')
    //虽然始终会加载
    if(true){
        require.ensure([],function(require){
            var di = require('./di')
        })
    }
}
load()
