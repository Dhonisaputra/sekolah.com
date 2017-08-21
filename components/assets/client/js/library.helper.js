/*
|
| ReplaceALL
|
*/
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
/*
|
| Remove Whitespace
|
*/
function remove_spacing(input)
{ 
    if(input)
    {
        return input.replace(/ /g,"");
    }
    return '';
}

/*
|------------------------------------------------
| Jquery can search element by pattern of their attribute.
|------------------------------------------------
|
|$('elm:attrNameStart(ng)')
*/
$.extend($.expr[':'],{
    attrNameStart: function(el,i,props) {

        var hasAttribute = false;

        $.each( el.attributes, function(i,attr) {
            if( attr.name.indexOf( props[3] ) !== -1 ) {
                hasAttribute = true;
                return false;  // to halt the iteration
            }
        });

        return hasAttribute;
    }
})

/*
|------------------------------------------------
| add prototype array diff into Array object.
|------------------------------------------------
*/
Array.prototype.diff = function(arr2) {
    var ret = [];
    for(var i in this) {   
        if(arr2.indexOf( this[i] ) > -1){
            ret.push( this[i] );
        }
    }
    return ret;
};
// -----------------------------------------------

/*
|------------------------------------------------
| add prototype array remove into Array object.
|------------------------------------------------
*/
Array.prototype.remove = function(index) {
    this.splice(index,1)
};
// -----------------------------------------------

/*
|------------------------------------------------
| Create uniqueid based on time.
|------------------------------------------------
*/
function unique_id()
{
   var uniq = new Date().valueOf();
   return uniq;
}
// ----------------------------------------------

/*
|------------------------------------------------
| Execution function by name.
|------------------------------------------------
|
| executeFunctionByName('helloWorld', window);
*/
function executeFunctionByName(functionName, context /*, args */ ) {

    var args = [].slice.call(arguments).splice(2),
        namespaces = functionName.split("."),
        func = namespaces.pop();
    
    for (var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
    }
    
    return context[func].apply(this, args);
}
// ----------------------------------------------

/*
|------------------------------------------------
| Remove item in an array.
|------------------------------------------------
|
| var a = [a,b,c,d,e]
| removeArray(a, index)
*/
function removeArray(array, index)
{
    array.splice(index,1)
}
    
/*
|------------------------------------------------
| Set pop up will appears at center of screen.
|------------------------------------------------
|
| popUpCenter('http://www.google.com', 'Google', 100, 200, 'other,parameters', {}  )
*/
function popupCenter(url, title, w, h, other, data) {
    // Fixes dual-screen position                         Most browsers      Firefox
    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

    var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    var top = ((height / 2) - (h / 2)) + dualScreenTop;
    var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left+',scrollbars,'+other);

    if(data)
    {
        var form = '<form method="post" action="" target="TheWindow">';
    }
    // Puts focus on the newWindow
    if (window.focus) {
        newWindow.focus();
    }
    return newWindow;
}

/*
|------------------------------------------------
| Class Sort arrays.
|------------------------------------------------
|
|   var a = [{alphabet:'c'},{alphabet:'a'},{alphabet:'e'}]
|   var b = [2,1,3,4,5,6]
|   var s = new sortBy(b,'-'); // [6,5,4,3,2,1]
|   var s = new sortBy(b); // [1,2,3,4,5,6]
|   var s = new sortBy(a,'alphabet', 's'); // [{alphabet:'a'},{alphabet:'c'},{alphabet:'e'}]
|   var s = new sortBy(a,'-alphabet', 's'); // [{alphabet:'e'},{alphabet:'c'},{alphabet:'a'}]
*/
function sortBy(objs, prop, typeProp)
{
    var $this = this;
    $this.property   = '';
    $this.type       = 's';
    $this.sortOrder  = 1;
    function set_sort_property(prop){
        console.log(prop)
        if(prop[0] === "-") {
            $this.sortOrder = -1;
            prop = prop.substr(1);
        }
        $this.property = prop;
    }
    function get_sort_property(){return $this.property;}
    function set_sort_type(settype){$this.type = settype? settype : 's';}
    function get_sort_type(){return $this.type;}

    function compare(a,b) {
        var sortOrder = 1;
        var prop = get_sort_property()
        if(prop.length > 0 )
        {
            switch(get_sort_type())
            {
                case 'i':
                    a[prop] = parseInt(a[prop]);       
                    b[prop] = parseInt(b[prop]);       
                    break;
                case 'b':
                    a[prop] = JSON.parse(a[prop]);       
                    b[prop] = JSON.parse(b[prop]);
                    break;
                case 's':
                default:
                    a[prop] = String(a[prop]);       
                    b[prop] = String(b[prop]);  
                    break;
            }
            var result = (a[prop] < b[prop]) ? -1 : (a[prop] > b[prop]) ? 1 : 0;
        }else{
            switch(get_sort_type())
            {
                case 'i':
                    a = parseInt(a);       
                    b = parseInt(b);       
                    break;
                case 'b':
                    a = JSON.parse(a);       
                    b = JSON.parse(b);
                    break;
                case 's':
                default:
                    a = String(a);       
                    b = String(b);
                    break;
            }
            var result = (a < b) ? -1 : (a > b) ? 1 : 0;
        }
        return result*sortOrder;
    }
    if(prop) set_sort_property(prop);
    if(typeProp) set_sort_type(typeProp);
    $this.sortObj = objs.sort(compare);
    return $this.sortObj;

}
// -----------------------------------------------------------------

/*
|------------------------------------------------
| Copy text from textarea / string direct copy.
|------------------------------------------------
|
| copy('textarea', callback())
| copy('lorem ipsum dor amet...', callback())
*/
function copy()
{
    var params = arguments;
    var paramsLength = arguments.length;
    var e = params[0];
    var c = params[paramsLength-1];
    if($(e).length < 1)
    {
        var uniqueid = unique_id();
        var textareaId = "__temp_textarea__"+uniqueid;
        var element = $("<textarea id='"+textareaId+"'></textarea>");
        element.appendTo('body')
        .each(function(){
            $(this).val(e)
            $(this).select()
        })
    }else
    {
        $(e).select();
    }

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text was ' + msg);
            if($(e).length < 1)
            {
                $(this).remove();
            }
            if(typeof c == 'function')
            {
                c()
            }
        } catch (err) {
            console.error('Oops, unable to copy');
        }
}
// -----------------------------------------------------------------

/*
|------------------------------------------------
| Check if the passed str is JSON string or not.
|------------------------------------------------
|
| isJSON('foo') // false
| isJSON('{"json":true}') // true
*/
function isJSON(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
JSON.isJSON = function(str){
    return isJSON(str)
};

function formdata_builder(data, fData)
{
    // set and detect FormData constructor
    fData = fData && fData.constructor == FormData? fData : new FormData();  

    // jika data exist dan data.constructor bukan formdata
    if(data && data.constructor != FormData)
    {
        $.each(data, function(a,b){
            // Jika b bukan sebuah object file, dan didalam b ada object, gunakan stringify // Object File tidak boleh di stringify
            if(b.constructor != File)
            {
                if(typeof b == 'object')
                {
                    var length = b.constructor == Array? b.length : Object.keys(b).length;
                    console.log(length, b)
                    b = length > 0? JSON.stringify(b) : b;
                    fData.append(a,b);
                }
            }
        })
    }else
    {
        fData = data
    }
    return fData;
}
// -----------------------------------------------------------------

/*
|
| Ajax Sender
|
*/
function ajax(options)
{

    var deff  = $.Deferred(),
        fData = new FormData();  

        console.log(options.data.constructor == FormData, options.data)
    options = $.extend({
        cache   : false,
        upload_progress: function(event, percentage)
        {

        },
        download_progress: function(event, percentage)
        {

        },
        contentType : false,
        processData : false,
        type        : 'POST',
    }, options);

    if(!options.url)
    {
        alert('no url given');
        return false;
    }

    if(options.data && typeof options.data == 'object')
    {
        if(options.data.constructor != FormData)
        {
            $.each(options.data, function(a,b){
                // Jika b bukan sebuah object file, dan didalam b ada object, gunakan stringify // Object File tidak boleh di stringify
                if(b.constructor != File)
                {
                    b = typeof b == 'object'? JSON.stringify(b) : b;
                }
                fData.append(a,b);
            })
            options.data = fData;
        }
    }

    options.xhr = function() {
        var xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener("progress", function(evt) {
            if (evt.lengthComputable) {
                var percentComplete = (evt.loaded / evt.total)*100;
                options.upload_progress(event, percentComplete)
                //Do something with upload progress here
            }
       }, false);

       xhr.addEventListener("progress", function(evt) {
           if (evt.lengthComputable) {
               var percentComplete = (evt.loaded / evt.total)*100;
                options.download_progress(event, percentComplete)
               //Do something with download progress
           }
       }, false);

       return xhr;
    }

    options.success = function(data){
        deff.resolve(data);
    }
    options.error = function(data)
    {
        deff.reject(data);
    }
    $.ajax(options);

    return $.when(deff.promise());
}

/*
|
| HTML decode and encode;
|
*/
function html_encode(value)
{
    return $('<div/>').text(value).html();
}

function html_decode(value)
{
    return $('<div/>').html(value).text();
}
// ============================================================
function range(input, total, data)
{
    var arr = []
    total = parseInt(total);
    for (var i=input; i<total; i++) {
        o = data? data[i] : i
        if(o)
        {
            arr.push(o);
        }
    }

    return arr;
}

// manipulation url
    (function ( $ ) {
     
        $.URL = function(address)
        {
            return URL.get(address)
        }

     
    }( jQuery ));

    var URL = (function(){

        var o = function(){}
        o.prototype = 
        {
            get: function(string) {
                string = (string)? $('<a>',{href:string})[0] : $('<a>',{href:document.URL})[0]
                
                var isQuery = string.href.match(/\?(.*)/) == null ? false : true;
                
                var u = {
                    hash: {},
                    title: document.title,
                    hashRaw: string.hash,
                    queryRaw: string.search,
                    query: {},
                    origin: string.origin,
                    href: string.href,
                    host: string.host,
                    port: (string.port)? string.port : 80,
                    protocol: string.protocol,
                    hostname: string.hostname,
                    pathname: string.pathname,
                    access_url: string.origin+string.port+string.pathname,
                    hashArray: []
                },
                url = (url === undefined) ? document.URL : url;

                if (u.queryRaw !== '') {

                    var uQuery = u.queryRaw.substr(1)

                    $.each(uQuery.split('&'), function(a, b) {
                        var qName = b.match(/.*?(?=:)|.*?(?=\=)/);
                        qName = (qName)? qName : b;
                        var qVal = (b.match(/=(.*)/) !== null) ? b.match(/=(.*)/)[1] : '';
                        qName = Array.isArray(qName) == true ? qName[0] : qName;
                        u.query[qName] = qVal;
                    })

                }

                if (u.hashRaw !== '') {
                    
                    var uHash = u.hashRaw.match(/\#(.*)/),
                        uHRaw = uHash[0];

                    u.hashData = uHash[1];
                    $.each(u.hashData.split('&'), function(a, b) {
                        if (b !== '' && b !== undefined && b !== null) {
                            var hName = (b.match(/.*?(?=:)|.*?(?=\=)/) == null) ? b : b.match(/.*?(?=:)|.*?(?=\=)/);
                            var hVal = (b.match(/=(.*)/) !== null) ? b.match(/=(.*)/)[1] : undefined;
                            hName = Array.isArray(hName) == true ? hName[0] : hName;
                            u.hash[hName] = hVal;
                            u.hashArray.push(b)
                        }
                    })
                }

                return u;
            },
            params: function(params, address, config) {
                var obj = {}, i, parts, len, key, value, uri = URL.get(address);
                
                config = $.extend({
                    extend: true
                }, config)

                if (typeof params === 'string') {
                    value = location.search.match(new RegExp('[?&]' + params + '=?([^&]*)[&#$]?'));
                    return value ? value[1] : undefined;
                }

                if(config.extend == true)
                {
                    var _params = location.search.substr(1).split('&');
                    for (i = 0, len = _params.length; i < len; i++) {
                        parts = _params[i].split('=');
                        if (! parts[0]) {continue;}
                        obj[parts[0]] = parts[1] || true;
                    }
                }

                obj = $.extend(uri.query, obj)

                if (typeof params !== 'object') {return obj;}

                for (key in params) {
                    value = params[key];
                    if (typeof value === 'undefined') {
                        delete obj[key];
                    } else {
                        obj[key] = value;
                    }
                }

                parts = [];
                for (key in obj) {
                    if(key)
                    {
                        parts.push(key + (obj[key] === true ? '' : '=' + obj[key]));
                    }
                }

                return URL.get(address).access_url+'?'+parts.join('&');
            },
            add:
            {
                
            },
            update: 
            {
                remove: {
                    hash: function(objHash)
                    {
                        var hash = URL.get().hash;
                    }
                },
                build:
                {
                    hash: function(objHash)
                    {
                        var hash = [];
                        $.each(objHash, function(a,b){
                            var val = (b)? '='+b : '';
                            hash.push(a+val);
                        })
                        return hash.join('&'); 
                    }
                }
            }
        }

        return new o();

    })()

    function make_slug(text)
    {
        if(text)
        {
            var str = text.toLowerCase();
            str = str.replace(/[^a-z0-9]+/g, '-');
            str = str.replace(/^-|-$/g, '');
            return str;
        }
    }

    // read image
    function readFileAsDataUrl(file) {
        var deff = $.Deferred();
            var reader = new FileReader();

            reader.addEventListener("load", function () {
                deff.resolve(this)
            }, false);

            reader.readAsDataURL(file);
        return $.when(deff.promise());
    }


    $(document).ready(function(){

        // EVENT READER
        $('[ng-truncate]').each(function(e){
            var a = ['div','span', 'i','p']
            var context  = $(this)[0];
            var text = '';
            if(a.indexOf(context.localName) > -1)
            {
                text = context.textContent;
            }
            var maxLength   = $(this).attr('length');
            maxLength       = maxLength ? maxLength : 50;

            if (text.length > maxLength) {
                // split the text in two parts, the first always showing
                var firstPart   = String(text).substring(0, maxLength);
                var secondPart  = String(text).substring(maxLength, text.length);
                var withdot     = firstPart+'...';

                // create some new html elements to hold the separate info
                // var firstSpan   = $compile('<span>' + firstPart + '</span>')(scope);
                // var readMoreLink = '<br><a href="#/open/article/'+data.id_article+'">Read more</a> '

                $(this).html(withdot);

                // remove the current contents of the element
                // and add the new ones we created
            }
            
        })
        $('[ng-load]').on('load', function(e){
        })

        $(document).bind('DOMSubtreeModified',function(){
            // console.log("now there are " + $('[ng-load]').length + " links on this page.");
        })
    })

    // on keypress / shortcut mode
    window.key = []
    var Shortcut = function(options, callback)
    {
        var arr_code = 
        {
            0: 48,
            1: 49,
            2: 50,
            3: 51,
            4: 52,
            5: 53,
            6: 54,
            7: 55,
            8: 56,
            9: 57,

            a: 65,
            b: 66,
            c: 67,
            d: 68,
            e: 69,
            f: 70,
            g: 71,
            h: 72,
            i: 73,
            j: 74,
            k: 75,
            l: 76,
            m: 77,
            n: 78,
            o: 79,
            p: 80,
            q: 81,
            r: 82,
            s: 83,
            t: 84,
            u: 85,
            v: 86,
            w: 87,
            x: 88,
            y: 89,
            z: 90,
            shift: 16,
            enter: 13,
            backspace: 8,
            space: 32,
            left: 37,
            top: 38,
            right: 39,
            bottom: 40,
            tab: 9,
            capslock: 20,
            leftwindow: 91,
            rightwindow: 92,
            // ctrl: 17,
            // alt: 18,
            rightClickKey: 93,
            esc: 27,
            printScreen: 44,
            scrollLock: 145,
            break: 19,
            pause: 19,
            numLock: 144,
            '/': 111,
            '*': 106,
            '-': 109,
            '+': 107,
            num0: 96, 
            num1: 97,
            num2: 98,
            num3: 99,
            num4: 100,
            num5: 101,
            num6: 102,
            num7: 103,
            num8: 104,
            num9: 105,
            numDelete: 110,
            insert: 45,
            home: 36,
            pageUp: 33,
            delete: 46,
            end: 35,
            pageDown: 34,
            '`': 192,
            '-': 189,
            '=': 187,
            '[': 219,
            ']': 221,
            // '\\': 220,
            ';': 186,
            "'": 222,
            ',': 188,
            '.': 190,
            '/': 191,
        }
        var _deff_option = {
            target: undefined,
            command: undefined,
            trigger: 'keyup',
            callback: function(){}
        }
        var $this = this;
        $this.options = $.extend(_deff_option, options);

        if(!$this.options.target || !$this.options.command)
        {
            alert('Error on creating Shortcut '+$this.options.command);
            return false;
        }

        var fn = arguments;
        $this.options.command = $this.options.command.toLowerCase();
        var keyboard = $this.options.command.split('+');
        var ctrlIndex = keyboard.indexOf('ctrl');
        var altIndex = keyboard.indexOf('alt');
        var isCtrl = ctrlIndex>-1?true:false;
        var isAlt = altIndex>-1?true:false;

        if(isCtrl){ removeArray(keyboard,ctrlIndex); }
        if(isAlt){removeArray(keyboard,altIndex); }


        $( document ).delegate($this.options.target, $this.options.trigger, function(e) {
            var key = e.key.toLowerCase();
            if(key == keyboard[0])
            {
                e.preventDefault()
                if(typeof callback == 'function')
                {
                    callback(e);
                }
            }
        });
    }