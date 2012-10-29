;(function(namespace, global) {
	"use strict";
/**
* USAGE :
* lazyLoadLight(
* [ '/staticv2/js/jquery/jquery.js',
*   '/staticv2/js/jquery/jquery.plugin.js',
*   '/staticv2/js/homepage/your-custom-code.js'
* ],
* function() {
*   YOURCODE.init();
* });
*
* The loading technique comes from LazyLoad.
* Above that, we manage to include only once each file and to concatenate them on the fly
*/
    var script = document.getElementsByTagName('SCRIPT')[0];
    // sorry mom, no clean way to detect parallel downloads nor existence of onload event
    var bIsIE = /MSIE/.test( navigator.userAgent );

	var bSupportsAsync = function() {
		var script = document.createElement('SCRIPT');
		script.async = true;
		return ('async' in script);
	}();

  	var numberOfScriptDL = 0,
  		numberOfScriptRequired = 0;


    var insertScript = function insertScript(oFile) {
		//console.log('will include script #'+numberOfScriptRequired++ +':'+oFile.sFileName);
		//if (env.async || env.opera) {

		var node = document.createElement('script'),
			bDone = false;
		node.type = 'text/javascript';

		if(bSupportsAsync
			&& !bIsIE) { // IE10 supports async, but in a different way than gecko or webkit
			node.async = false;
		}
		node.defer = false;

/*		if (bIsIE === true) {
		    node.async = false; // IE cant' download scripts in parallel, but the packs are already loaded in parallel
		    // in HTML5 async = false is evaluated as async
		} else {
			node.async = false; // other browsers can download in parallel while keeping the execution order
			//node.defer = false;
	    }
	*/
		//node.async = false; // if set to false, browsers other than IE will block when 

		node.className = 'lazyloadlight';
		//node.setAttribute('charset', 'utf-8');


		node.onload = node.onreadystatechange = function () {
			var readyState = node.readyState;
			if (	bDone === false
					&& ( ! readyState || readyState == "loaded" || readyState == "complete" || readyState == "uninitialized" )
				) {
				// Handle memory leak in IE
				node.onload = node.onreadystatechange = null;
				finish(oFile);
				bDone = true;
			}
		};

		node.src = oFile.sFileName;
		//script.parentNode.appendChild( node );
		script.parentNode.insertBefore(node, script);
    };

    var finish = function finish(oFile) {
		// console.log('script '+numberOfScriptDL++ +' arrived '+oFile.sFileName);
        status[ oFile.sFileName ] = 1; // mark as loaded
        //runCallback(sFileName);
		/*if (oFile.callback) {
        	setTimeout(oFile.callback, 0);
        	//oFile.callback();
        }*/
        aPacks[ oFile.iPackId ].current++;
        runCallback(oFile.iPackId);
        //setTimeout(readQueue, 0);
        readQueue();
    };

	var runCallback = function runCallback(iPackId) {
		// console.log(aPacks[ iPackId ]);
		if(aPacks[ iPackId ].current === aPacks[ iPackId ].total ) {
			if(aPacks[ iPackId ].callback) {
				//setTimeout( aPacks[ iPackId ].callback, 0 );
				aPacks[ iPackId ].callback.call(global);
				delete aPacks[ iPackId ].callback;
				// aPacks[ iPackId ].current++;
			}/* else {
				console.log('no callback');
			}*/
		}/* else {
			console.log('skipped');
		}*/

		/*if (callbacks[sFileName]) {
			for(var i = 0; i < callbacks[ sFileName ].length; i++) {
				console.log('will execute callbacks for file '+sFileName);
				setTimeout( callbacks[ sFileName ][i], 0);
			}
			// remove the callbacks
			callbacks[ sFileName ] = [];
    	};
    	*/
    };

	var bIsReading = false; // lose lock system
    var readQueue = function readQueue() {
		/*if(bIsReading === true)
			return false;
		¨*/
		bIsReading = true;

		var oFile = dlQueue.shift();
		if(oFile === undefined) {
			// console.log('reached end of queue');
			bIsReading = false;
			return;
		}
		//console.log('required '+oFile.sFileName);
		// already loaded ? call the dependancies
		if(status[ oFile.sFileName ] === 1 ) {
			// loaded ?
			aPacks[ oFile.iPackId ].current++;
			runCallback(oFile.iPackId);
			//runCallback(sFileName);
			/*if(oFile.callback) {
				//setTimeout( oFile.callback, 0);
				oFile.callback();
			}*/
			//setTimeout(readQueue, 0);
			readQueue();
		} else if(status[ oFile.sFileName ] === 0 ) {
			return false;
		} else if (status[ oFile.sFileName ] === -1) {
			status[ oFile.sFileName ] = 0;
			/*if(!oFile.callback) {
				oFile.callback = readQueue;
			}*/
			// differ script insert, for FF to avoid double load
			insertScript( oFile );
			//setTimeout( function() {insertScript( oFile );}, 0);
		} else {
			throw new Error('sorry ?');
		}
	};

	var	dlQueue = [],
		aPacks = {},
		//callbacks =  {},
		status = {}; // contains -1, 0, 1



    var basePath = '';
    var regHTTP = /^http|\/\//;
    var iPackId = 0;

    // use the DOM to resolve URLs
    var urlResolver = document.createElement('a');

	  // shortcut to the loader
	namespace.lazyLoadLight = function loadJS( list, callback ) {
		var sFileName,
			sPrevious,
			sFirstFile;

		iPackId++;

		//console.log('will insert ', list);
		for(var i = 0, iLength = list.length; i < iLength; i++) {
			// use the DOM to resolve URLs
			urlResolver.href = list[i];
			sFileName = urlResolver.href.toString(); 
			sFileName = sFileName.match( regHTTP ) ? sFileName : basePath+sFileName;

			// the last file is responsible for running the callback
			//dlQueue[dlQueue.length-1].callback = callback;

			// record the new download
			dlQueue.push( {
					iPackId:iPackId,
					sFileName:sFileName/*,
					callback: (i === iLength-1)?callback:null // last included file triggers the callback
					*/
				});
			// mark as "to load" if not already loaded
			if( !(sFileName in status) ) {
				status[sFileName] = -1;

			}
		}
		// trigger the callback once per downloaded pack. Last file was not working on some browsers
		aPacks[iPackId] = {
			total: iLength,
			current:0,
			callback:callback
		};
		/*if( !callbacks[ sFileName ] ) {
		    callbacks[ sFileName ] = [];
	    }
		callbacks[ sFileName ].push( callback );*/
		//console.log(dlQueue);
		// start the process
		//setTimeout(readQueue, 0);
		if(bIsReading === false)
			readQueue();
	};

	// will be used for relative urls
	namespace.lazyLoadLight.setBasePath = function(sBase) {
		basePath = sBase;
	};

// by default, registered in the global namespace (that's bad, change that)
}( window.YOUR_NAMESPACE || this, this));
