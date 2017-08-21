(function ( $ ) {
	$.fn.snackbar = function(options)
	{
		options = $.extend({element: this[0], trigger:'show',timeout: 0,spinner : false }, options)
		switch(options.trigger)
		{
			case 'manual':
				if(options.timeout == 0)
				{
					Snackbar.manual(options.element, options.message)
				}
				break;

			case 'show':		
				Snackbar.call(options)
				break;
		}
	};
}( jQuery ));


var Snackbar = (function(){
	var o = function(){
		this.template = '<div id="snackbarTemp" class="mdl-snackbar mdl-js-snackbar"> <div class="mdl-snackbar__text"></div> <button type="button" class="mdl-snackbar__action"></button> </div>'
		this.config();
		componentHandler.upgradeAllRegistered();
	}
	o.prototype = 
	{
		manual: function(options)
		{
			options = $.extend({element: '#snackbarTemp', message:'no message',spinner : false}, options)
			if(!options.message)
			{
				console.error('please add message into snackbar')
				return false
			}

			$(options.element).addClass('mdl-snackbar--active').find('.mdl-snackbar__text').text(options.message)
			if(options.spinner)
			{
				$(options.element).find('.mdl-spinner').css('display','inherit')
			}else
			{
				$(options.element).find('.mdl-spinner').css('display','none');
			}
		},
		config: function(options)
		{
			options = $.extend({ 
				template: this.template,
				message : 'no message',
				action : function(event){},
				// action_text: '',
				// timeout: 10,
				show: false
			},options);

			this.template = options.template;
			this.message = options.message;

			if(options.show)
			{

			}
		},

		call: function(options)
		{
			if(typeof options == 'string')
			{
				options = {message: options};
			}

			options = $.extend({
				element : document.querySelector('#snackbarTemp'),
				message : this.message,
				spinner : false
			}, options)
			
			if(options.element)
			{
            	options.element.MaterialSnackbar.showSnackbar(options);
			}
			if(options.spinner)
			{
				$(options.element).find('.mdl-spinner').removeClass('sr-only')
			}else
			{
				$(options.element).find('.mdl-spinner').addClass('sr-only')
			}

		},
		show: function(options)
		{
			this.call(options);
		},
		hide: function(element)
		{
			$(element).removeClass('mdl-snackbar--active');
		}

	}

	return new o();
})()