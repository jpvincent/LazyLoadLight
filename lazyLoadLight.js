;(function(namespace, global) {
	"use strict";
/**
* USAGE :
* lazyLoadLight(
* [ '/staticv2/js/jquery/jquery.js',
*   '/staticv2/js/homepage/homepage.js',
*   '/staticv2/js/homepage/kmeleo-home.js'
* ],
* function() {
*   YOURPLUGIN.init();
* });
*
* The loading technique comes from LazyLoad.
* Above that, we manage to include only once each file and to concatenate them on the fly
*/
/**
* fork of the LazyLoad library
* has been stripped down to reduce weigth : everything concerning CSS has been removed
*/
var LazyLoad = (function (doc) {
	// User agent and feature test information.
	var env,
	head,
	// Requests currently in progress, if any.
	pending = false,

	// Number of times we've polled to check whether a pending stylesheet has
	// finished loading. If this gets too high, we're probably stalled.
	pollCount = 0,

	// Queued requests.
	queue = [];


	/**
	Creates and returns an HTML element with the specified name and attributes.

	@method createNode
	@param {String} name element name
	@param {Object} attrs name/value mapping of element attributes
	@return {HTMLElement}
	@private
	*/
	function createNode(attrs) {
		var node = doc.createElement('script'), attr;

		for (attr in attrs) {
			if (attrs.hasOwnProperty(attr)) {
				node.setAttribute(attr, attrs[attr]);
			}
		}

		return node;
	}

	/**
	Called when the current pending resource of the specified type has finished
	loading. Executes the associated callback (if any) and loads the next
	resource in the queue.

	@method finish
	@param {String} type resource type ('css' or 'js')
	@private
	*/
	function finish() {
	var p = pending,
		callback,
		urls;

	if (p) {
	  callback = p.callback;
	  urls     = p.urls;

	  urls.shift();
	  pollCount = 0;

	  // If this is the last of the pending URLs, execute the callback and
	  // start the next request in the queue (if any).
	  if (!urls.length) {
		callback && callback.call(p.context, p.obj);
		pending = null;
		queue.length && load();
	  }
	}
	}

	function getEnv() {
		var ua = navigator.userAgent;

		env = {
			async: doc.createElement('script').async === true
		};

		(env.webkit = /AppleWebKit\//.test(ua))
			|| (env.ie = /MSIE/.test(ua))
			|| (env.opera = /Opera/.test(ua))
			|| (env.gecko = /Gecko\//.test(ua))
			|| (env.unknown = true);
		}

		function load(urls, callback, obj, context) {
		var _finish = function () { finish(); },
			nodes   = [],
			i, len, node, p, pendingUrls, url;

		env || getEnv();

		if (urls) {
			urls = typeof urls === 'string' ? [urls] : urls.concat();

			if (env.async || env.opera) {
			// Load in parallel.
				queue.push({
					urls    : urls,
					callback: callback,
					obj     : obj,
					context : context
				});
			} else {
				// Load sequentially.
				for (i = 0, len = urls.length; i < len; ++i) {
					queue.push({
						urls    : [urls[i]],
						callback: i === len - 1 ? callback : null, // callback is only added to the last URL
						obj     : obj,
						context : context
					});
				}
			}
		}

		// If a previous load request of this type is currently in progress, we'll
		// wait our turn. Otherwise, grab the next item in the queue.
		if (pending || !(p = pending = queue.shift())) {
			return;
		}

		head || (head = doc.head || doc.getElementsByTagName('head')[0]);
		pendingUrls = p.urls;

		for (i = 0, len = pendingUrls.length; i < len; ++i) {
			url = pendingUrls[i];

			node = createNode({src: url});
			node.async = false;

			node.className = 'lazyload';
			node.setAttribute('charset', 'utf-8');

			if (env.ie) {
				node.onreadystatechange = function () {
					if (/loaded|complete/.test(node.readyState)) {
						node.onreadystatechange = null;
						_finish();
					}
				};
			} else {
				node.onload = node.onerror = _finish;
			}

			nodes.push(node);
		}

		for (i = 0, len = nodes.length; i < len; ++i) {
			head.appendChild(nodes[i]);
		}
	}

	return {
		load:load
	};
})(global.document);

// FROM HERE : the custom code to manage to include only once the requested files

  var aDependancies = {};
  var aCallbacks = {};
  // will check that all files are downloaded. If so, will run the associated callbacks
  var executeCallbacks = function() {
	for(var sCallbackHash in aCallbacks) {
	  var bAllLoaded = true,
		oCallback = aCallbacks[sCallbackHash];
	  for(var i =0, iLength = oCallback.aDependancies.length; i < iLength; i++) {
		if(aDependancies[ oCallback.aDependancies[i] ] !== 2) {
		  bAllLoaded = false; // at least one dependancy is missing
		  //break; // no need to go further
		}
	  }
	  if(bAllLoaded === true) {
		// execute the callbacks, and prevent a second execution
		for(var i = 0; i < oCallback.aCallbacks.length; i++) {
		  //console.log(oCallback.aCallbacks[i]);
		  // defer execution to avoid CPU hog
		  setTimeout(oCallback.aCallbacks[i], 0);
		  //oCallback.aCallbacks[i].call(global);
		}
		delete aCallbacks[sCallbackHash];
	  }
	}

	//console.log(aCallbacks);
  };

  var basePath = '';
  var regHTTP = /^http|\/\//;

  // shortcut to the loader
  namespace.lazyLoadLight = function loadJS( list, callback ) {
	
	// LazyLoad does not manage unique file call, so we do implment that
	var finalList = [],
		sCallbackHash = [],
		sFileName;
	for(var i = 0, iLength = list.length; i < iLength; i++) {
		// urls starting with http(s) or protocol-relative urls are not prefixed.
		// the other are supposed relative, so we prefix them
		sFileName = list[i].match( regHTTP ) ? list[i] : basePath+list[i];
		//console.log(sFileName);
		if( !aDependancies[ sFileName ] ) {
			finalList.push(sFileName);
			// mark as loading
			aDependancies[sFileName] = 1;
		}
		sCallbackHash.push(sFileName);
		list[i] = sFileName;
	}
	
	sCallbackHash = sCallbackHash.join('|');
	// create the callback list for these dependancies
	if(!aCallbacks[sCallbackHash]) {
		aCallbacks[sCallbackHash] = { aDependancies:list, aCallbacks:[] };
	}
	// update it
	aCallbacks[sCallbackHash].aCallbacks.push(callback);
	
	//console.log(finalList, aCallbacks);
	if(finalList.length > 0) {
		LazyLoad.load(finalList, function load() {
			//debugger;
			// console.log('loaded');
			// mark as read
			for(var i = 0, iLength = finalList.length; i < iLength; i++) {
				// mark as loaded
				aDependancies[finalList[i]] = 2;
			}
			executeCallbacks();
		});
	} else {
		executeCallbacks();
	}
};

	// set it for 
	namespace.lazyLoadLight.setBasePath = function(sBase) {
		basePath = sBase;
	};

// by default, registered in the global namespace (that's bad)
}( this.MY_NAMESPACE || this, this));