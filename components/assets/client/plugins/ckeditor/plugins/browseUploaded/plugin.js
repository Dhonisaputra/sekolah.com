CKEDITOR.plugins.add( 'browseUploaded', {
    icons: 'browseUploaded',
    init: function( editor ) {
        function handleAfterCommandExec(editor)
        {
            if(editor.config.urlBrowseUploaded)
            {
            	editor.config.urlBrowseUploaded.width = editor.config.urlBrowseUploaded.width? editor.config.urlBrowseUploaded.width : 600;
            	editor.config.urlBrowseUploaded.height = editor.config.urlBrowseUploaded.height? editor.config.urlBrowseUploaded.height : 400;
    	        if(!popupCenter)
    	        {
    	        	alert('Library helper for popupCenter not found!');
    	        	return false;
    	        }
    	        popupCenter(editor.config.urlBrowseUploaded.url, 'browseUploaded', editor.config.urlBrowseUploaded.width, editor.config.urlBrowseUploaded.height)
            }else
            {
            	alert('Please define urlBrowseUploaded object with url, width and height!');
            	return false;
            }
        }

        editor.ui.addButton( 'browseUploaded', {
            label: 'Browser Image / File that have you uploaded',
            command: 'Browse uploaded',
            toolbar: 'insert',
            click: handleAfterCommandExec
        });

        editor.addCommand('browseUploaded', {
            exec : function(editor) {
                // get button information
            },
            readImages: function()
            {
                
            }
        });

    }
});