/*
$('#confirmation-assessment--input-upload').on('change', function(event){
	var ui = $(this)
	var btnTrigger = $(window.triggeredUpload);
	var target= $(btnTrigger).parents('.list-schedule-item').find('.upload-confirmation-result')
	// console.log(ui, btnTrigger, target)
	
	$.Upload( ui )
	.done(function(res){
		// tulis data file uploaded
		Tools.write_data({
			target: target,//'#upload-confirmation-result',
			records: res,
			template: '<div class="list-group-item list-group-item--attachment-confirmation" id="file-uploaded-::key::"> <button class=" mdl-button mdl-js-button mdl-button--icon" onclick="removeFile(\'::name::\')"><span class="material-icons">clear</span> </button> ::name:: </div>'
		})

		// reset input type file
		ui.val('');
	})
})
*/
	var Uploadify = function(target, params)
	{
		if(!target)
		{
			alert('please, specify target');
			return false;
		}

		$.Upload(target, params)
	}

	var upload_instances = function(params)
	{
		if(!params.name)
		{
			alert('please, specify input name');
			return false;
		}
		var $this = this;


		$this = $.extend({}, params)
		$this.method = {}
		$this.method.delete = function(keyname)
		{
			// var index = $this.method.check_existence_file(keyname);
			delete $.Upload.records[$this.name][keyname];
			delete $.Upload.instances[$this.name]['records'][keyname];
		}
		$this.method.reset = function()
		{
			// var index = $this.method.check_existence_file(keyname);
			$.Upload.instances[$this.name]['records'] = {};
		}
		$.Upload.instances[params.name] = $this;

	}

	$.Upload = function(element, options)
	{
		var name = $(element).attr('name');
		var defOpt = {
			name: name,
			target: element
		}
		options = $.extend(defOpt, options);
		if( !name && name == "")
		{
			console.error('Attribute nama tidak ditemukan!');
			return false;
		}
		/*
		| code error
		*/
		var code = {
			5001: {text: 'Maaf file tidak dapat diproses karena termasuk dalam file yang tidak diperbolehkan. silahkan pilih file yang lain', code: 5001, title: 'File tidak diterima'}
		}
		function code_error(error)
		{
			return code[error];
		}
		/*
		|----------------
		| get extention
		|----------------
		| @params string 
		*/
		function _get_extention(filename)
		{
			return filename.split('.').pop();
		}

		function _exist_in_excluded_ext(ext)
		{
			var type = []
			if(typeof $.Upload.options.not_accepted_files == 'string')
			{
				type = $.Upload.options.not_accepted_files.replace(/\s/g, '').split(',');
			}

			return ( type.indexOf(ext) > -1 )? true : false;
		}

		function _not_exist_in_accepted_ext(ext)
		{
			var type = []
			if(typeof $.Upload.options.accepted_files == 'string')
			{
				type = $.Upload.options.accepted_files.replace(/\s/g, '').split(',');
			}
		
			return ( type.indexOf(ext) > -1 )? true : false;

		}
		var deff = $.Deferred(), 
		promises 	= [],
		datapromise = [];
		var element = $(element)[0];

		var opts = $.extend({
			target: $(element),
			name: options.name
		}, 
		$.Upload.options);

		opts = $.extend( 
			{options:opts, records:[]},
			options,
		)

		if(!$.Upload.instances[name])
		{
			new upload_instances(opts);
		}

		var files 	 	= element.files;
		$.each(files, function(a,b){
			var def = new $.Deferred();
			// var inExcludeOne = _exist_in_excluded_ext(_get_extention(b.name));
			var notAccepted = _not_exist_in_accepted_ext(_get_extention(b.name))
			if($.Upload.options.accepted_files != '' && !notAccepted)
			{
				console.error('maaf, '+b.name+' tidak dapat ditambahkan karena ekstensi tidak diperbolehkan.')
				// alert('maaf, '+b.name+' tidak dapat ditambahkan karena ekstensi tidak diperbolehkan.')
				return deff.reject(event, code_error(5001), b);

			}else
			{
				if( $.Upload.test_size(b.size) )
				{
					$.Upload.append($(element).attr('name'), b, $(element).attr('multiple'))
					.done(function(res){
						def.resolve(res);
						promises.push(def);
						datapromise.push(res);
						// reset element input type file
					});
				}
			}

		})

		$.when.apply(undefined, promises)
		.done(function(res){
			deff.resolve(datapromise);
			if($.Upload.instances[name]['options']['resetOnChange'] == true)
			{
				$(element).val('');
			}
		})


		return deff.promise();
	}
	$.Upload.parseToData = function(data)
	{
		return $.Upload.data_submit(data)
	}
	$.Upload.options = 
	{
		minimum_size: 100000000,
		accepted_files: '', // typea, typeb, typec, | ['typea', 'typeb', ... ] / ['image', ]
		not_accepted_files: null,
		name: 'file',
		url: undefined,
		resetOnChange: true
	}

	$.Upload.records = {}
	$.Upload.instances = {}
	$.Upload.define_key_files = function(name)
	{

		var i = [];
		if( $.Upload.records[name] )
		{

			$.each( $.Upload.records[name], function(a,b){
				var expl 	= a.split('-');
				if(expl.length > 1)
				{
					expl		= expl.pop();
					i.push(expl);
				}
			});

			return i.length > 0? parseInt(i.pop()) + 1 : 1;
		
		}else
		{
			return 1;
		}
	}

	$.Upload.reset = function(name)
	{
		if(name)
		{
			$.Upload.records[name] = {}
		}else
		{
			$.Upload.records = {}
		}
	}
	$.Upload.append = function(name, file, multiple)
	{
		var deff 	= $.Deferred();
		var key 	= $.Upload.define_key_files(name);
		nameSplit 	= file.name.split('.'); 
		file['key'] = key;
		file['is_image'] = file.type.split('/').indexOf('image') > -1?true:false;
		file['ext'] = nameSplit[nameSplit.length-1];

		nameSplit.pop();
		file['original_name'] = nameSplit.join('.');
		
		if(!$.Upload.records[name])
		{
			$.Upload.records[name] = {}
		}
		var keyname = !multiple? name : name+'-'+key;
		$.Upload.records[name][keyname] = file;	

		file['input_name'] = name;
		file['keyname'] = keyname;
		if(file.is_image)
		{
			$.Upload.read_image($.Upload.instances[name].target[0])
			.done(function(res){
				file['content'] = res.target.result
				deff.resolve( file );
			})
		}else
		{
			deff.resolve( file );
		}

		deff.pipe(function(){
			$.Upload.instances[name].records = $.Upload.records[name];
		})

		return $.when(deff.promise() );

	} 
	$.Upload._count_filename = function(filename)
	{
		var find = []
		$.each($.Upload.records, function(a,b){

			if(b.name == filename)
			{
				find.push('true')
			}else
			{
				find.push('false')
			}
			
		})
		return find;
	}
	$.Upload.is_file = function(filename)
	{	
		return ($.Upload._count_filename(filename).indexOf('true') > -1)? true : false;
	}

	$.Upload.count_files = function(filename)
	{
		return $.Upload._count_filename(filename).filter(function(res){ return res == 'true' }).length;
	}
	
	$.Upload.delete = function(filename, key)
	{
		var deff 	= $.Deferred(),
			obj 	= {key: '', value: {} };
		$.each($.Upload.records, function(a,b){
			/*untuk versi lama yang hanya mengisikan filename saja*/
			if(!key)
			{

				if(b.name == filename)
				{
					obj.key 	= a;
					obj.value 	= b;
			
					deff.resolve(obj);
				}
			}else
			{
				if(b.name == filename && b.key == key)
				{
					obj.key 	= a;
					obj.value 	= b;
			
					deff.resolve(obj);
				}else
				{
					deff.reject();
				}
			}
			
		})

		deff.pipe(function(res){
			delete $.Upload.records[res.key];
			return res;
		})

		return $.when(deff.promise())

	}

	$.Upload.test_size = function(size)
	{
		if(size > $.Upload.options.minimum_size && $.Upload.options.minimum_size !== 0)
		{
			console.error('file lebih besar daripada minimum size. silahkan pilih file dengan size < '+$.Upload.options.minimum_size);
			return false;
		}
		return true;
	}
	$.Upload.remove = function(name, key)
	{
		$.each( $.Upload.records[name], function(a,b){

			if(b.key == key)
			{
				delete $.Upload.records[name][a]
			}
		} )
	}
	$.Upload.read_image = function(input, timeout)
	{
		if(!input)
		{
			console.error('Please specify input element.');
			return false;
		}
		var def = $.Deferred();
	    if (input.files && input.files[0]) {
	        var reader = new FileReader();

	        reader.onload = function (e) {
    			def.resolve(e)        
	        }

	        reader.readAsDataURL(input.files[0]);
	    }
	    return $.when( def.promise() );
	}

	$.Upload.file_reader = function(data, success, timeout)
	{
		timeout = timeout? timeout : 1000;
		var def = $.Deferred();
	    if (data) {
	        var reader = new FileReader();

	        reader.onload = function (e) {
	    		if(typeof success == 'function'){
	    			success(e)
	    		}
    			setTimeout(function() {
	    			def.resolve(e)
    			}, timeout);
	        }

	        reader.readAsDataURL(data);
	    }
	    return $.when( def.promise() );
	}

	$.Upload.data_submit = function(other_data_that_will_send)
	{
		var fData = other_data_that_will_send.constructor == FormData? other_data_that_will_send : new FormData();
		if(Object.keys($.Upload.instances).length > 0)
		{
			$.each($.Upload.instances, function(a,b){
				if(Object.keys(b.records).length > 0)
				{
					$.each(b.records, function(c,d){
						fData.append(c,d);
					})
				}
			})
		}

		if(other_data_that_will_send && other_data_that_will_send.constructor != FormData)
		{
			$.each(other_data_that_will_send, function(a,b){
				b = typeof b == 'object'? JSON.stringify(b) : b;
				fData.append(a,b);
			})
		}

		return fData;
	}

	/*
	* reset uploaded file
	*/
	$.Upload.reset = function(options)
	{
		$.Upload.records = {}
	}
	
	$.Upload.submit = function(options)
	{
		options = $.extend({
			url: $.Upload.options.url,
			upload_progress: function(){},
			download_progress: function(){},
		}, options);

		var deff  = $.Deferred(),
			fData = new FormData();  

		if( options.url && Object.keys($.Upload.records).length > 0 )
		{
			$.each($.Upload.records, function(a,b){

				$.each(b, function(c,d){
					fData.append(c,d);
				})
			})

		}
		else
		{
			console.error('no url defined! or no file uploaded. sent data without file!');
		}

		if(options.data)
		{
			$.each(options.data, function(a,b){
				b = typeof b == 'object'? JSON.stringify(b) : b;
				fData.append(a,b);
			})
		}

		$.ajax({
		    url 	: options.url,
		    data 	: fData,
		    cache 	: false,
		    contentType : false,
		    processData : false,
		    type 		: 'POST',
		    success 	: function(data){
		    	deff.resolve(data);
		    	$.Upload.reset();
		    },
		    error: function(data)
		    {
		    	deff.reject(data);
		    },
		    xhr: function() {
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
		    },

		});

		return deff.promise();
	}
	
