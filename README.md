LazyLoadLight
=============

Yet another JS async loader. What are the specificities ?
* small enough to be put inline in the `HEAD` : 2K with minification only
* robust and cross browser : heavily inspired by the famous [Ryan Grove LazyLoad lib](https://github.com/rgrove/lazyload/)
* with modules developers in mind : somewhere in your HTML template, simply declare the full list of JS dependancies, your callback, et voilà
* optimized : 
** never blocks the browser
** download each file only once
** get scripts in parallel for browsers that support it
** get packs of scripts in parallel for all browsers (yes, that speeds up IE)


Usage
-----
Whenever you want, generally just after your DOM container is here, lazy load your JS and all of its dependancies

```html
	<div id="container">Not yet enhanced content</div>
	<script>
		lazyLoadLight(
			// list dependancies
			[	"http://code.jquery.com/jquery-1.7.2.min.js",
				"http://underscorejs.org/underscore-min.js"],
				function() {
					// oh yeah, we needed jQuery to do that !
					$('#container').html('Content lazily enhanced');
				}
			);
	</script>
```

Is Lazy loading efficient ?
---------------------------

If your page is heavy, it's visually more efficient to lazy load ASAP in the source loads of JS files, rather than having them concatenated at the bottom and execute all at the same time. The user sees the top modules enhanced with JS much sooner, and that's what matters.

Future :
--------
* be extendable : add place for hooks
* allow to lazy load the lazyLoadLight plugins
* write a plugin for grouping the calls

Supported Browsers
------------------

* Firefox 2+
* Google Chrome
* Internet Explorer 6+
* Opera 9+
* Safari 3+
* Mobile Safari
* Android

License
-------

Copyright (c) 2012 Jean-pierre VINCENT (jp@braincracking.org).
All rights reserved.
 
Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.