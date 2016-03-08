

function pct(val) {
    // convenience method to generate percentages for positioning alto blocks
    return val*100 + '%';
}

function insert_alto(container) {
    // create positioned devs from mets/alto blocks

    var page = container.find('Page'),
        page_height = page.attr('HEIGHT'),
        page_width = page.attr('WIDTH'),
        content = $('#contents');

    if (page_height === undefined && page_width == undefined) {
        // some versions of alto has no dimensions on the page, but
        // has size on printspace tag just inside the page element
        var printspace = page.find('PrintSpace');
        page_height = printspace.attr('HEIGHT');
        page_width = printspace.attr('WIDTH');
    }
    var blocks = page.find('[HEIGHT]');
    console.log('found ' + blocks.length + ' blocks with height attribute');
     $.each(blocks, function(i, el) {
        var div = $('<div class="block"> </div>');
        el = $(el), parent = el.parent(),
            parent_height = parent.attr('HEIGHT'),
            parent_width = parent.attr('WIDTH');
        div.css({'height': pct(el.attr('HEIGHT') / page_height),
            'width': pct(el.attr('WIDTH') / page_width),
            'left': pct(el.attr('HPOS') / page_width),
            'top': pct(el.attr('VPOS') / page_height)});
        // set content as text, if present
        var text = el.attr("CONTENT");
        if (typeof text !== typeof undefined && text !== false) {
            div.text(text).addClass('text-content')
               .css({'font-size': (el.attr('HEIGHT') / page_width)*100 + 'vw'});
        }

        content.append(div);
    });

    $('.block').on('click', function(el){
        $(this).toggleClass('selected');
    })

}


// html5 drag & drop functionality adapted from
// http://www.html5rocks.com/en/tutorials/file/dndfiles/

function handleFileSelect(evt) {
    $('#drop_zone').removeClass('active');
    evt.stopPropagation();
    evt.preventDefault();


    var files = evt.dataTransfer.files; // FileList object.

    // files is a FileList of File objects. Add brief display of dropped file
    var output = [],
        list = $('#file-list');
    for (var i = 0, f; f = files[i]; i++) {
        // display information about the file
        var item = $('<li/>')
            .html('<strong>' + f.name + '</strong> ' +
            '(' + (f.type || 'n/a') + ') - ' + f.size + ' bytes, last modified ' +
             (f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a'));
        list.append(item);

        // if mimetype is text/xml, process & display as ALTO
        if (f.type == 'text/xml') {
            /* read in xml */
            var reader = new FileReader();
            reader.onload = function(e) {
              var xmlDoc = $.parseXML(reader.result);
              var $xml = $(xmlDoc),
                  $layout = $xml.find("Layout");
                  insert_alto($layout);
            }

            reader.readAsText(files[0]);
        }

    }

    // if a url is dropped, assume it is an image
    var dropped_uri = evt.dataTransfer.getData('text/uri-list')
    if (dropped_uri) {
        setImage(dropped_uri);
    }
}

function setImage(imgurl){
    $('#contents img').attr('src', imgurl);
}

$(document).ready(function() {

    var dropZone = document.getElementById('drop_zone');
    function handleDragOver(evt) {
        $(dropZone).addClass('active');
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    function active(event) {
        $(dropZone).addClass('active');
        event.stopPropagation();
        event.preventDefault();
    }


    function inactive(evt) {
        $(dropZone).removeClass('active');
    }

    // Set up the drag&drop listeners.
    dropZone.addEventListener('dragenter', active, false);
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('dragleave', inactive, false);
    dropZone.addEventListener('drop', handleFileSelect, false);

    // allow img/alto to be loaded via querystring parameter
    var image_url = $.getUrlVar('img');
    var alto_url = $.getUrlVar('alto');
    if (image_url) {
        setImage(image_url);
    }
    if (alto_url) {
        $.ajax({
            type: "GET",
            url: "http://cors.io/?u=" + alto_url,
            dataType: "xml",
            success: function(xml) {
                var $layout = $(xml).find("Layout");
                insert_alto($layout);
            }
        });

    }


});


// access to query string parameters
// via http://stackoverflow.com/questions/7731778/jquery-get-query-string-parameters
$.extend({
      getUrlVars: function(){
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
          hash = hashes[i].split('=');
          vars.push(hash[0]);
          vars[hash[0]] = hash[1];
        }
        return vars;
      },
      getUrlVar: function(name){
        return $.getUrlVars()[name];
      }
    });

    //Second call with this:
    // Get object of URL parameters
    var allVars = $.getUrlVars();

    // Getting URL var by its nam
    var byName = $.getUrlVar('name');