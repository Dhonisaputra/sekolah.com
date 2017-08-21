var Analytics_server = (function(){
	

	var o = function(){

	}
	o.prototype = 
	{
		// collaboration with akar.socketio.js
		__set_socket: function(io)
		{
			this.__io = io;
		},
		set_server: function(server_url)
		{
			console.log(this.__io)
			if(this.__io)
			{
				this.__io.socket.disconnect()
			}
			this.__set_socket(server_url);
		},
		get_io: function()
		{
			return this.__io
		},
		__extract_country: function(data_visitor )
		{
			var countries = {}
			$.each(data_visitor, function(a, b){
				var geo = b.context.ip_geolocation;
				if(!countries[geo.country_name])
				{
					countries[geo.country_name] = []		
				}
				countries[geo.country_name].push(geo)
			})

			return countries;

		},
		get_all_properties: function(id_user, callback)
		{
			this.__io.send('Analytic_data/get_all_properties', {id_user: id_user})
			.done(function(res){
				if(callback && typeof callback == 'function'){ 
					callback(res)
				}
			})	
		},
		get_specific_property: function(id_user, id_property)
		{

			var deff = $.Deferred();
			this.__io.send('Analytic_data/get_specific_properties', {id_user: id_user, id_property: id_property})
			.done(function(res){
				Cookies.set('active_property', res);
				deff.resolve(res)
			})	
			return $.when(deff.promise())
		},
		get_data_property: function(id_property)
		{
			var deff = $.Deferred();
			var __parents = this;
			this.__io.send('Analytic_data/get_property', {id_property: id_property})
			.done(function(res){
				var countries = __parents.__extract_country(res)
				deff.resolve({
					countries: countries,
					raw: res
				})
			})	

			return $.when(deff.promise());
		}
	}

	return new o()
})()
