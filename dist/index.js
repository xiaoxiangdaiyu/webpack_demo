webpackJsonp([1],[
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	var react = __webpack_require__(2)
	var tool = __webpack_require__(1)
	// var b = require('./b')
	function load(){
	    // b()
	    tool()
	    console.log('全部文件都从一个入口打包')
	    //虽然始终会加载
	    if(true){
	        __webpack_require__.e/* nsure */(2, function(require){
	            var di = __webpack_require__(13)
	        })
	    }
	}
	load()


/***/ })
]);