---
---
// bookmarklet code adapted from
// https://www.smashingmagazine.com/2010/05/make-your-own-bookmarklets-with-jquery/

(function(){

    // the minimum version of jQuery we want
    var v = "1.3.2";

    // check prior inclusion and version
    if (window.jQuery === undefined || window.jQuery.fn.jquery < v) {
        var done = false;
        var script = document.createElement("script");
        script.src = "http://ajax.googleapis.com/ajax/libs/jquery/" + v + "/jquery.min.js";
        script.onload = script.onreadystatechange = function(){
            if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
                done = true;

                if (window.RdxAltoVis === undefined) {
                    initRdxAltoVis();
                } else {
                   RdxAltoVis();
                }
            }
        };
        document.getElementsByTagName("head")[0].appendChild(script);
    } else {
        initRdxAltoVis();
    }



    function initRdxAltoVis() {
        if (!String.prototype.startsWith) {
           String.prototype.startsWith = function(searchString, position){
           position = position || 0;
           return this.substr(position, searchString.length) === searchString;
          };
        }
        (window.RdxAltoVis = function() {
            var img_url = $('img.page-image').attr('src'),
                alto = document.location + 'ocr/';
            console.log(img_url);
            if (img_url === undefined) {
                alert("Readux page image not found. " +
                    "This bookmarklet can only be run on individual Readux volume pages.");
                return;
            }
            if (! img_url.startsWith('http')) {
                img_url = window.location.protocol + '//' + window.location.host + img_url;
            }
            window.location.href = '{{ site.bookmarklet_url }}{{ site.baseurl }}/?img=' + img_url + '&alto=' + alto;
        })();
    }

})();