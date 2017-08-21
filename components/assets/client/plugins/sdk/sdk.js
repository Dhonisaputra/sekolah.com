var _url = function(){}
	_url.prototype = 
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

	var ngeblog = function(){
		$_ = this;
		$_.blog = {}
		$_.blog.url = '';
		$_.blog.version = 'v1';
		$_.blog.server = '';
		$_.fn = {}
		$_.method = {}
		$_.blog.method = ['POST', 'GET'];

		$_.fn.set_blog = function(blog)
		{
			$_.blog.url = blog[blog.length -1] == '/' ? blog : blog+'/';
		}
		$_.fn.get_blog = function()
		{
			return $_.blog.url;
		}
		$_.fn.set_version = function(v)
		{
			$_.blog.version = v;
		}
		
		$_.fn.set_blog_server = function(server)
		{
			$_.blog.server = server;
		}
		$_.fn.request = function(url)
		{
			var v = $_.method.get_version();
			url = url?url: 'me';
			return $_.method.server('api/'+v+'/'+url)
		}

		// -----------------------------------------------------------------
        $_.method.set_version = function($v)
        {
            $_.fn.set_version($v);
        }
		$_.method.get_version = function()
		{
			return $_.blog.version;
		}
		$_.method.initialize = function(blogserver, version)
		{
			$_.fn.set_blog(blogserver);
			$_.fn.set_blog_server(blogserver);
		}
		$_.method.url = function()
		{
			url = url?url:''
			return $_.blog.url+'#/'+url
		}
		$_.method.server = function(url)
		{
			url = url?url:''
			return $_.blog.server + url
		}
        $_.method.create_url = function(v, path)
        {
            v = v?v:$_.method.get_version();
            var url = $_.fn.request(path);
            return url;
        }

		$_.method.api = function(path, method, params, config)
        {
            var def_config = {version: 'v1'}
            config = $.extend(def_config, config)
            
            $_.method.set_version(config.version)
               
            var deff = $.Deferred();
            method = !$_.blog.method.indexOf(method)? method : 'GET';
            method = method.toLowerCase();
            var url = $_.fn.request(path);
            $[method](url, params)
            .done(function(res){
                if(JSON.isJSON(res))
                {
                    res = JSON.parse(res);
                }
                
                deff.resolve(res)
            })
            .fail(function(res){
                deff.reject(res)
            })

            return $.when(deff.promise())
        }
        $_.method.url = function(url, params, callback)
		{
			var deff = $.Deferred();
			$.get(url, params)
			.done(function(res){
                res = JSON.parse(res);
				deff.resolve(res)
			})
			.fail(function(res){
				deff.reject(res)
			})

			return $.when(deff.promise())
		}
		return $_.method;
	}
	
	var ngeblog = new ngeblog();


/*
ngeblog('http://projectblog.laboratorium.xyz');

ngeblog.api('/article', {fields:''}, function(res){
	console.log(res)
})
*/