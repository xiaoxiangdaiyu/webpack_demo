/**
 * Created by panqianjin on 16/4/11.
 */
module.exports = 'this is webpack by pqj';
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