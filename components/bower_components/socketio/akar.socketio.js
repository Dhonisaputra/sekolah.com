/*
--- WHAT IS THIS ---
Ini adalah plugin helper untuk emit dan listen event dari socketio di server node.js
node js disini hanya sebagai terminal untuk data nya dilempar ke event yang lain

- Lihat gambar berikut untuk lebih jelas http://prntscr.com/dzui5q

--- HOW TO USE ---
// declare Notif
var socket = new Notif(:server) // we have been created node.js server as terminal using heroku. the URL is https://infinite-dusk-57108.herokuapp.com/

// listen event
socket.listen(:event-emited, :function(:data-emited) )

// emit data 
socket.emit(:event-target, :data)


*/
	var Node = function(listener){
		if(listener)
		{
			this.socket= io(listener);
			this.server_listener = listener;
		}
	}
	Node.prototype = 
	{
		send: function(emit, data)
		{
			var def = $.Deferred();
			this.socket.emit(emit, {data: data}, function(res){
				def.resolve(res, data)
			} )

			return $.when(def.promise());
		},
		listen: function(event, fn)
		{
			this.socket.on( event, fn);
		},
		disconnect: function()
		{
			if(this.server_listener)
			{
				this.socket.disconnect();
			}
		},
		set_server: function(server)
		{
			if(!server)
			{
				console.error('no server defined! return false');
				return false;
			}
			this.server_listener = server;
		},
		join_room: function (room, server) {
 			if(this.server_listener)
			{
			    return io(this.server_listener, {
			        query: 'room='+room
			    });
			}else
			{
				console.error('No server listen defined!. return false')
				return false;
			}
		}
	}