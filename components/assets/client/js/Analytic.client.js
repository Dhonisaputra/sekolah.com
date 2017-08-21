/*
	Analytic.track('ads',{
		name: 'Badminton badminton',

	})
*/

function fetching_ip(json)
{
	Analytic.set_iplocation(json);
}

var Analytic = (function()
{
	

	var browser = function() {
	    // Return cached result if avalible, else get result then cache it.
	    if (browser.prototype._cachedResult)
	        return browser.prototype._cachedResult;

	    // Opera 8.0+
	    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

	    // Firefox 1.0+
	    var isFirefox = typeof InstallTrigger !== 'undefined';

	    // Safari 3.0+ "[object HTMLElementConstructor]" 
	    var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);

	    // Internet Explorer 6-11
	    var isIE = /*@cc_on!@*/false || !!document.documentMode;

	    // Edge 20+
	    var isEdge = !isIE && !!window.StyleMedia;

	    // Chrome 1+
	    var isChrome = !!window.chrome && !!window.chrome.webstore;

	    // Blink engine detection
	    var isBlink = (isChrome || isOpera) && !!window.CSS;

	    return browser.prototype._cachedResult =
	        isOpera ? 'Opera' :
	        isFirefox ? 'Firefox' :
	        isSafari ? 'Safari' :
	        isChrome ? 'Chrome' :
	        isIE ? 'IE' :
	        isEdge ? 'Edge' :
	        undefined;
	};
	var channel = function()
	{
		return browser()? 'browser' : 'others';
	}
	// Extract "GET" parameters from a JS include querystring
	function getParams(script_name) {
	  	// Find all script tags
	  	var scripts = document.getElementsByTagName("script");
	  
	  	// Look through them trying to find ourselves
	  	for(var i=0; i<scripts.length; i++) {
	    	if(scripts[i].src.indexOf("/" + script_name) > -1) {
		      	// Get an array of key=value strings of params
		      	var pa = scripts[i].src.split("?").pop().split("&");

			    // Split each key=value into array, the construct js object
		      	var p = {};
		      	for(var j=0; j<pa.length; j++) {
		        	var kv = pa[j].split("=");
		       		p[kv[0]] = kv[1];
		      	}
		      	return p;
	    	}
	  	}
	  
	  	// No scripts match
	  	return {};
	}

	var o = function(){
		var elmScript = 
		{
			filename: 'Analytic.client',
			keyParam: 'key'
		}
		var srcParams = getParams(elmScript.filename);
		if(!srcParams[elmScript.keyParam]) { var error_text = 'no key found!'; console.error(error_text); return false; }
		this.__ready_deferred 	= $.Deferred();
		this.__server 			= 'http://localhost/experiments/analytic/client'
		this.__server_listener 	= 'http://research-analytic.herokuapp.com'
		this.__key 				= srcParams.key
		this.source = 
		{
			anonymousID: browser()+'-'+this.__key,
		}
		this.__check_key(this.__key, function(){
			Analytic.init()
		});

		this.min_length_session_wait = 10000; // in miliseconds
		this.max_length_session_wait = 1000*60*30; // in miliseconds
	
	}
	o.prototype = 
	{
		init: function()
		{
			var deff = $.Deferred();
			var __parents = this;
			this.__construct(function(){

				deff.resolve();
				__parents.__ready_deferred.resolve()
			});
			return $.when( deff.promise() )
		},
		__set_anonymousID: function()
		{			
			// set localStorage
			var __parents = this
			var data_anonym = {name: this.source.anonymousID, createdAt: Date.now()}
			if(!localStorage['__anonymousID__ai'])
			{
				localStorage.setItem('__anonymousID__ai', JSON.stringify( data_anonym ) )
				return 1
			}else
			{
				if(localStorage['__anonymousID__ai']['name'] == data_anonym.name)
				{
					return 0
				}else
				{
					localStorage.setItem('__anonymousID__ai', JSON.stringify( data_anonym ) )
					return 1
				}
			}

		},
		__getSessionID: function(ip)
		{
			ip = (ip)? '-'+ip : '';
			if(!sessionStorage[this.source.anonymousID+'-sessionID'])
			{
				var sessionID = this.source.anonymousID+'-'+Date.now()+ip;
				sessionStorage.setItem(this.source.anonymousID+'-sessionID', sessionID)
				return sessionID;	
			}else
			{
				return sessionStorage[this.source.anonymousID+'-sessionID'];
			}
		},
		__check_key: function(key, callback)
		{
			var __parents = this;
			$.ajax({
				url: __parents.__server_listener+'/check/analytic/key',
			 	data: {key:key},
				type: 'get',
				success: function(res){
					if(!res.is_key)
					{
						var error_text = 'Key not match. please check again your key!';
						alert(error_text)
						console.error(error_text);
						return false;
					}
					callback()
				}
			})
		},
		__construct: function(callback)
		{
			var __parents = this;
			var requirement_js = [
				'http://freegeoip.net/json/?callback=fetching_ip',
				this.__server+'/assets/plugins/url_parser.js',
				this.__server+'/bower_components/socketio/socketio.js',
				// this.__server+'/bower_components/bootstrap/js/scrollspy.js',
				this.__server+'/bower_components/socketio/akar.socketio.js',

			]
			var deferreds = $.map(requirement_js, function(current){
				return $.getScript(current)				
			})
			$.when.apply($, deferreds).then(function(res) {
				__parents.__data();
				__parents.__io = new Notif(__parents.__server_listener);

				if(callback && typeof callback == 'function')
				{
					callback();
				}
		    });
		},
		__ip_source: function(json)
		{
			this.set_iplocation(json)
		},
		__load_source: function(url, callback)
		{
			var __parents = this;
			$.ajax({
                url: url,
                dataType: 'jsonp',
                success: callback
            });
		},
		__data: function(others){
			var sendAt 		= Date.now()
			var url 		= URL.get();
			var ipSource 	= this.__ipgeolocation;
			var __parents 	= this;
			var ipnotdot 	= ipSource.ip.replace(/\./g,'');
			var source =  {
				analyticKey	: __parents.__key,
				isNewVisitor: __parents.__set_anonymousID(),
				sessionID 	: __parents.__getSessionID(ipnotdot),
				channel 	: channel(),
				sendAt 		: sendAt,
				timestamp 	: sendAt,
				creator 	: 'user',
				context 	:
				{
					browser 		: browser(),
					ip_geolocation 	: ipSource,
					useragent 		: navigator.userAgent,
					page: {
						hash 	: url.hash,
						query 	: url.query,
						queryRaw: url.queryRaw,
						host 	: url.host,
						hashRaw : url.hashRaw,
						hostname: url.hostname,
						href 	: url.href,
						origin 	: url.origin,
						pathname: url.pathname,
						protocol: url.protocol,
						port 	: url.port,
						title 	: url.title,
						referrer: document.referrer, // document.referrer
						isReferral: document.referrer == ''? false : true,
					},
					screen: {
						height 		: window.screen.height,
						width 		: window.screen.width,
						colorDepth 	: window.screen.colorDepth,
						pixelDepth	: window.screen.pixelDepth,
						orientation_angle 	: window.screen.orientation.angle,
						orientation_type 	: window.screen.orientation.type
					},
					library: {
						name: 'Analytic.js',
						versi: '0.1.0',
					}

				}
			}


			this.source = $.extend(this.source, source)
		},
		
		ready: function(callback)
		{
			$.when(this.__ready_deferred.promise())
			.done(callback)
		},
		set_iplocation: function(json)
		{
			this.__ipgeolocation = json
		},
		get_iplocation: function()
		{
			return this.__ipgeolocation
		},
		get_data: function()
		{
			return this.source
		},
		__send: function(type, event, trigger, traits, properties, callback, set_data)
		{
			var params 		= arguments;
			if(typeof type == 'object')
			{
				var data 		= type 
				var type 		= (!data.type)? 'page' : data.type; 
				var event 		= (!data.event)? 'page' : data.event;
				var trigger 	= (!data.trigger)? 'onload' : data.trigger;
				var properties 	= (!data.properties)? {} : data.properties;
				var traits 		= (!data.traits || typeof data.traits != 'object')? {} : data.traits;
				var callback 	= (!data.callback)? function(){} : data.callback;
				var set_data 	= (!data.set_data || typeof data.set_data == 'function')? {} : data.set_data;

			}else{
				
				var type 		= !params[0] || typeof params[0] == 'function' ? 'page' : params[0];
				var event 		= (!params[1] || typeof params[1] == 'function')? 'visit' : params[1];
				var trigger 	= (!params[2] || typeof params[2] == 'function')? 'onload' : params[2];
				var traits 		= (!params[3] || typeof params[3] == 'function')? {} : params[3];
				var properties 	= (!params[4] || typeof params[4] == 'function')? {} : params[4];
				var callbackIndex = Object.keys(params).map(function(res){return typeof res}).indexOf('function');
				var callback 	= (callbackIndex < 0)? function(){} : params[callbackIndex];
				var set_data 	= (!params[6] || typeof params[6] == 'function')? {} : params[6];
			}

			var data = this.get_data();
			data = $.extend(data, set_data );
			data.type = type
			data.event = event
			data.traits = traits
			data.trigger = trigger
			data.properties = properties
			this.__io.send('Analytic/push', data, function(res){
			console.log(data)
				if(typeof callback == 'function'){ callback(res); }
				else if(typeof callback == 'string'){window[callback](res)}
			})
		},
		track: function(type, event, traits, properties, callback)
		{
			this.__send(type, event, traits, properties, callback )
		},
		
		bind_detection_element : function(element, autosend)
		{
			var data 		= $(element).data('analytic');
			var type 		= $(element).attr('analytic-type');
			var trigger 	= $(element).attr('analytic-trigger');
			var event 		= $(element).attr('analytic-event');
			var traits 		= this.__separate_data( $(element).attr('analytic-traits') );
			var properties 	= this.__separate_data( $(element).attr('analytic-properties') );
			var callback 	= $(element).attr('analytic-callback');
			callback 		= callback? callback : function(){}
			Analytic.track(type, event, trigger, traits, properties, callback)
			// return newData;
		},

		__separate_data: function(data)
		{
			if(!data || data == ''){ return {} }
			else{
				data = data.replace(/^\{/,'').replace(/\}$/,'');
				data = data.split(',');
				var newData = {}
				$.each(data, function(a,b){
					var item = b.split(':');
					if(item[0] != '')
					{
						var index = item.shift().replace(/ /g,"");
						var value = item.join(':').replace(/^\{/,'').replace(/\}$/,'').toString();
						newData[index] = value;
					}
				})
				return newData;
			}
		},

		event_listener_scroll: function()
		{

		}
	}
	return new o()
})()



Analytic.ready(function(){
	$( window ).scroll(function(e) {
	  	var pageTop 	= $(window).scrollTop();
	  	var pageBottom 	= pageTop + $(window).height();
	  	var fullyInView = true

	  	$('[analytic][analytic-trigger="onscreen"]').each(function(){
	  		var elementTop 		= $(this).offset().top;
	  		var elementHeight	= $(this).height();
	  		var elementBottom 	= elementTop + elementHeight;
	  		var data 			= $(this).data();
	  		var name 			= $(this).attr('name');
	  		if(!name)
	  		{
	  			alert('analytic name not found'); return false;
	  		}

	  		// minTimeWait
	  		var minWait 		= !$(this).attr('analytic-min-timer')? 5000 : $(this).attr('analytic-min-timer'); // min 5 seconds
	  		var maxWait 		= !$(this).attr('analytic-max-timer')? 1000*60*5 : $(this).attr('analytic-max-timer'); // max 5 minutes

	  		// console.info('pageTop : '+pageTop, 'pageBottom : '+pageBottom, 'elementTop : '+elementTop, 'elementBottom : '+elementBottom, 'elementHeight : '+elementHeight)

  			// on element enter screen
  			if((pageBottom > elementTop) && (pageTop < elementBottom))
  			{
  				if(!data.__analytic_inScreen){
  					data.__analytic_inScreen = true;
  					data.__analytic_outScreen = true;
  					console.warn('enterScreen');
  				}
  			}

  			// on element show full screen
  			/*
				ketika element diatara screen atau screen berada di tengah-tengah element.
  			*/
  			if( 
  				(pageBottom  > elementBottom && pageTop<elementTop) || 
  				(pageBottom  < elementBottom && pageTop>elementTop) )
  			{
  				if(!data.__analytic_onScreen){
  					data.__analytic_onScreen = true;
  					console.warn('onScreen');
  					$(this).data('__analytic_onScreen_timer', Date.now());
  				}
  			}

  			// when out of fullscreen
			if( 
				(pageTop > elementTop && pageBottom>elementBottom && data.__analytic_onScreen == true) ||  
				(pageTop < elementTop && pageBottom<elementBottom && data.__analytic_onScreen == true)
				){
					delete data.__analytic_onScreen;
					delete data.__analytic_inScreen;
					console.warn('out onScreen');
  				}	  			

  			// when element leave focus in screen
  			if( ((pageBottom > elementBottom) && (pageTop > elementBottom) ) ||  ((pageBottom < elementTop) && data.__analytic_outScreen == true) )
  			{
  				delete data.__analytic_onScreen
  				delete data.__analytic_inScreen;
  				if(data.__analytic_outScreen == true){
  					
  					var onScreenTimer 	= $(this).data('__analytic_onScreen_timer');
  					var leaveScreen		= Date.now()
  					var onLeaveTimer 	= leaveScreen - onScreenTimer;
  					onLeaveTimer 		= onLeaveTimer > maxWait ? maxWait : onLeaveTimer;

  					if(onLeaveTimer > minWait)
  					{
  						Analytic.track({
							event: 'onscreen',
							type: 'onscreen',
							traits: 
							{
								session_count: onLeaveTimer,
								enterScreen: onScreenTimer,
								leaveScreen: leaveScreen,
								name: name
							},
							set_data: {
								creator: 'system',
							},
						})
  					}
  					delete data.__analytic_outScreen
					delete data.__analytic_onScreen_counter
  					console.warn('leaveScreen');
  				}
  			}
	  	})
	});

	// on click
	$(document).delegate('[analytic-trigger="click"]', 'click', function(res){
		Analytic.bind_detection_element($(this),true)
	})

	// send when session > 10 detik
	var __time_start_session = 0;
	setTimeout(function(){
		__time_start_session = Date.now();
	}, Analytic.min_length_session_wait)

	// on before unload
	window.onbeforeunload = function(e) {
		var __end_time_session 	= Date.now();
		var total_time_session 	= __end_time_session - __time_start_session;
		var define_30_minutes 	= Analytic.max_length_session_wait;
		total_time_session 		= total_time_session > define_30_minutes? define_30_minutes : total_time_session;
		// untuk kredibilitas data, maksimal waktu session adalah 30 menit.

		Analytic.track({
			event: 'onsession',
			type: 'session',
			properties: {
				session_count: total_time_session
			},
			set_data: {
				creator: 'system',
			},
		})
	};


	if( $('[analytic][analytic-trigger="onload"][type="page"]').length > 0 )
	{
		$('[analytic][analytic-trigger="onload"][type="page"]').each(function(){
			Analytic.bind_detection_element($(this),true)
		})
	}else{
		Analytic.track('page')
	}
})
