# webpack优化之code splitting
作为当前风头正盛的打包工具，webpack风靡前端界。确实作为引领了一个时代的打包工具，很多方面都带来了颠覆性的改进，让我们更加的感受到自动化的快感。不过被大家诟病的一点就是用起来太难了，要想愉快的使用，要使用n多的配置项，究其原因在于文档的不够详细、本身集成的不足。也不能说这是缺点吧，更多的主动权放给用户就意味着配置工作量的增加，这里就不过多探讨了。当历尽千辛万苦，你的项目跑起来之后，可能会发现有一些不太美好的问题的出现，编译慢、编译文件大等，是的我们还要花些时间来看看怎么优化我们的配置了。下面一起看一下代码拆分的问题。

## code splitting出现的背景 
对于前端资源来说，文件体积过大是很影响性能的一项。特别是对于移动端的设备而言简直是灾难，所以需要拆分，。此外对于某些只要特定环境下才需要的代码，一开始就加载进来显然也不那么合理，这就引出了按需加载的概念了。  
如果我们使用webpack直接打包的话，没有注意这些事项的话，那么很可能这些问题就已经出现了，如果打包文件本身比较小的话，这些影响
为了解决这些情况，代码拆分就应运而生了。
代码拆分故名思意就是将大的文件按不同粒度拆分，以满足解决生成文件体积过大、按需加载等需求。具体到webpack而言有下面几种方式来达到我们的目的。
## webpack实现代码拆分的三种方式   
webpack通过下面三种方式来达到以上目的
1. Entry Points: 多入口分开打包
2. Prevent Duplication:去重，抽离公共模块和第三方库
3. Dynamic Imports:动态加载 
这里不去列文档上的定义了，我们从一个例子中来体会他们不同的作用。

假设我们有这么个项目，有下面几个文件![pro](media/15168440734141/pro.png)
代码很简单(示例而已，直接用commonjs的语法来写了):  

```js
//a.js
var react = require('react')
var tool = require('./tool')
var b = require('./b')
function load(){
    b()
    tool()
    console.log('全部文件都从一个入口打包')
}
load()
//b.js
var react = require('react')
var tool = require('./tool')
function b(){
    tool()
    console.log('这是bjs文件')
}
module.exports = b;
//tool.js
var react = require('react')
function tool(){
    console.log('这是tooljs文件')
}
module.exports = tool;
```  

配置很简单:

```js
var webpack = require('webpack');module.exports = {
    entry: './codesplitting/c1/a.js',
    output: {
        path: __dirname,
        filename: '/dist/index.js'
    }
    //*****
}
```
直接打包：可以看到文件大小有2047行,体积也变大了
![例子1](media/15168440734141/%E4%BE%8B%E5%AD%901.png)
目前只引入了react，并且业务代码几乎没有的情况下。大家可以猜到实际项目中的情况了。来让我们进行第一优化  
### Entry Points
如果业务中的项目不是单页面应用，这一步可以忽略了，直接是多入口打包。这里是为了演示效果，强行分一个模块出来打包，假设我们的文件也很大，需要将b.js单独打个包出来:

```js
    entry: {
        index:'./codesplitting/c1/a.js',
        other:'./codesplitting/c1/a.js'
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js'
    }，
    //***
```
这里a.js也需要修改,去掉对b的引用。入口文件之间不能相互引用的。不然，问题就大了，到底以谁为主呢，这样就陷入了循环引用的问题。
此时的生成文件如下:
![例子2](media/15168440734141/%E4%BE%8B%E5%AD%902.png)

看来文件竟然只小了那么一点了吧？第一步的优化这里就完成了，显然你会认为我在开玩笑，当然这只是万里长征第一步，看一下dist下的文件不难发现两个文件中都把react这个第三方库和tool.js这个可复用模块打进去了，显然这样重复打包有点没必要，是不是可以把这些复用性强的模块拿出来单独打包呢？这样浏览器第一次请求之后就会将该文件缓存起来，从服务端请求的只有体积缩小之后的业务文件了，这样的话加载速度显然会有所提升。如果你也是这么想的，来一起继续看下去。

### Prevent Duplication  
webpack去除重复引用是通过[CommonsChunkPlugin](https://webpack.js.org/plugins/commons-chunk-plugin/)插件来实现的。该插件的配置项如下：

```js
{
    //被抽离为公共文件的chunk名，例如common,可以是string或者数组
    //显然如果是单个的模块，就是name多个就是names
    name:string,
    names:[],
    //打包之后公共模块的名称模板
    //例如'[name].js'
    //如果省略，则和name名称一致
    filename:string,
     //模块被引的最小次数，也就是说至少有几个组件引用了该模块。
    //如果是Infinity，则表明单纯的创建，并不做任何事情
    minChunks:2  
}
```
具体在webpack中去重对于第三方库显示声明vendor，公共模块声明common的方式来处理

```js
entry: {
        index:'./codesplitting/c1/a.js',
        other:'./codesplitting/c1/b.js',
        //第三方库显示声明
        vendor:['react'],
        //公共组件声明为common
        common:['./codesplitting/c1/tool']
    },
    //***
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            names:["common", "vendor"],
            filename: "[name].js"
        })  
    ]
```  

打包结果如下：
![例子3](media/15168440734141/%E4%BE%8B%E5%AD%903.png)
可以看到index和other两个业务包已经很小了，react被抽离到单独的包中。这样还有一个问题，对于某些代码可能只有在特定条件下才执行，或者可能就不执行，我不希望在首屏就去加载它，也就是我们常说的按需加载是要怎么做呢。一起看下去。  
### Dynamic Imports  
webpack建议如下两种方式使用动态加载。
1)、ECMAScript中出于提案状态的import()
2)、webpack 特定的 require.ensure
我们这里就是用第二种来看下效果(毕竟偷懒没用babel...),在ajs中动态引入di.js  

```js
    //虽然始终会加载,大家能明白就行
    if(true){
        require.ensure([],function(require){
            var di = require('./di')
        })
    }
    //新增动态加载的js
    function di(){
        tool()
        console.log('这是动态引入的文件')
    }
    module.exports = di;
```
运行之后可以发现多了个2.2.js,打开可以发现就是我们新建的动态引入的di.js
![](media/15168440734141/15168903830462.jpg)
大家可能会问怎么确定就是动态引入的呢，虽然本示例只能看打包之后的例子(就不引入dev server了，毕竟是懒。。。)我们依然可以从代码里看到结果。
首先、查看index.js文件，可以看到下面的代码：

```js
      var react = __webpack_require__(2)
	   var tool = __webpack_require__(1)  
	   /****省略8*****/
      //虽然始终会加载
	    if(true){
	        __webpack_require__.e/* nsure */(2, function(require){
	            var di = __webpack_require__(13)
	        })
	    }
```

与直接require的模块不同,require.ensure被转化为了 __webpack_require__.e方法，来继续看一下该方法有什么用。

```js  
   	__webpack_require__.e = function requireEnsure(chunkId, callback) {
		// "0" is the signal for "already loaded"
		if(installedChunks[chunkId] === 0)
			return callback.call(null, __webpack_require__);

		// an array means "currently loading".
		if(installedChunks[chunkId] !== undefined) {
			installedChunks[chunkId].push(callback);
		} else {
			// start chunk loading
			installedChunks[chunkId] = [callback];
			var head = document.getElementsByTagName('head')[0];
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.charset = 'utf-8';
			script.async = true;

			script.src = __webpack_require__.p + "" + chunkId + "." + ({"0":"common","1":"index","3":"other"}[chunkId]||chunkId) + ".js";
			head.appendChild(script);
		}
	};
```  
结合注释直接从源码中可以看出来，最后面的条件语句来创建script标签进而实现动态加载的。所谓动态加载本质还是要创建script标签来实现的。至此
## webpack异步加载的实现原理
## react 单页面应用按需加载 
    

