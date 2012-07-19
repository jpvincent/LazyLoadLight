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
    var createElement = document.createElement,
        script = document.getElementsByTagName('SCRIPT')[0];
    // sorry mom, no clean way to detect parallel downloads nor existence of onload event
    var bIsIE = /MSIE/.test( navigator.userAgent );
  
    var insertScript = function insertScript(sFileName) {
        //if (env.async || env.opera) {
			
		var node = document.createElement('script');
		node.src = sFileName;
		if (bIsIE === true) {
		    node.async = false; // IE cant' download scripts in parallel, but the packs are already loaded in parallel
		} else {
		    node.async = true; // other browsers can download in parallel while keeping the execution order
	    }
		//node.async = false; // if set to false, browsers other than IE will block when 

		node.className = 'lazyloadlight';
		//node.setAttribute('charset', 'utf-8');

		if (bIsIE === true) {
			node.onreadystatechange = function () {
				if (/loaded|complete/.test(node.readyState)) {
					node.onreadystatechange = null;
					finish(sFileName);
				}
			};
		} else {
			node.onload = node.onerror = function() { finish(sFileName); };
		}
		
		script.parentNode.appendChild( node );
    };
    
    var finish = function finish(sFileName) {
        //console.log( 'finished ' + sFileName );
        status[ sFileName ] = 1; // mark as loaded
        readQueue( sFileName );
    };
    
    var readQueue = function readQueue(sFileName) {
        
        // is dependancy loaded ?
        if( deps[ sFileName ] ) {
            for( var sDependancyName in deps[ sFileName ] ) {
                if( sDependancyName != 'callback'
                    && status[ sDependancyName ] < 1 ) {
                    return false;
                }
            }
        }
        //console.log( status[ sFileName ] );
        // already loaded ? call the dependancies
        switch( status[ sFileName ] ) {
            case 1: // loaded ? load the next dependancy
                //debugger;
                for( var sDependancyName in nextAction[ sFileName ] ) {
                    // execute associated callbacks
                    if( sDependancyName === 'callback' ) {
                        for(var i = 0; i < nextAction[ sFileName ].callback.length; i++) {
                            setTimeout( nextAction[ sFileName ].callback[i], 0);
                        }
                        // remove the callbacks
                        nextAction[ sFileName ].callback = [];
                    } else { // continue to get down the tree
                        delete nextAction[ sFileName ][ sDependancyName ]; // deleting before running next item in the queue allows breaking circular references
                        // but remove the leafs one by one
                        readQueue( sDependancyName );
                    }
                }
                break;
            case 0: // loading ? well, just wait
                return false;
                break;
            case -1: // not loaded ? start the download
            //console.log('will insert '+ sFileName );
                status[ sFileName ] = 0;
                insertScript( sFileName );
                break;
            default:
                throw new Error('sorry ?');
        }
            
        
    };
    
    var nextAction = {},
        deps = {},
        status = {}; // contains -1, 0, 1
    
    
    
    var basePath = '';
    var regHTTP = /^http|\/\//;
    // var iPackId = 0;
    
  // shortcut to the loader
namespace.lazyLoadLight = function loadJS( list, callback ) {
	
	//iPackId++; // dowload packs in parallel
	
	var sFileName,
	    sPrevious,
	    sFirstFile;
	
	for(var i = 0, iLength = list.length; i < iLength; i++) {
		// urls starting with http(s) or protocol-relative urls are not prefixed.
		// the other are supposed domain relative, so we prefix them
		sFileName = list[i].match( regHTTP ) ? list[i] : basePath+list[i];
		
		// register the new download
		if( !nextAction[sFileName] ) {
		    nextAction[sFileName] = {};
		    deps[sFileName] = {};
		    // mark as "to load" if not already loaded
		    status[sFileName] = status[sFileName] || -1;
        }
        
		// start by filling the 2 dependancy trees
		if( sPrevious ) {
		    nextAction[ sPrevious ][ sFileName ] = true;
		    deps[ sFileName ][ sPrevious ] = true;
		} else {
		    sFirstFile = sFileName;
	    }
		sPrevious = sFileName;
	}
	// the last file is responsible for running the callback
	if( !nextAction[ sFileName ].callback ) {
	    nextAction[ sFileName ].callback = [];
    }
	nextAction[ sFileName ].callback.push( callback );
	
	// start the process
	readQueue( sFirstFile );
};

	// will be used for relative urls
	namespace.lazyLoadLight.setBasePath = function(sBase) {
		basePath = sBase;
	};

// by default, registered in the global namespace (that's bad, change that)
}( this.YOUR_NAMESPACE || this, this));