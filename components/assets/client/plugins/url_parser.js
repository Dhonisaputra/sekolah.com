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