/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here.
	// For complete reference see:
	// http://docs.ckeditor.com/#!/api/CKEDITOR.config

	// The toolbar groups arrangement, optimized for two toolbar rows.

	// remove plugins
	config.removePlugins = 'elementspath';
	config.resize_enabled = false;
	

	/*config.toolbarGroups = [
		{ name: 'insert', groups: [ 'insert' ] },
		{ name: 'links', groups: [ 'link', 'links', 'font' ] },
		{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
		{ name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'paragraph' ] }
	];*/
	config.toolbar = [
		{ name: 'insert', items: [ 'Source', 'browseUploaded', 'Image', 'Table', 'HorizontalRule', 'SpecialChar', 'CodeSnippet', 'Embed',"oembed", "PageBreak" ] },
		{ name: 'links', items: [ 'Link', 'Unlink' ] },
		{ name: 'paragraph', items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ] },
		{ name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', 'Undo', 'Redo', 'Font', 'FontSize', 'Format', 'PasteFromWord' ] },
		{ name: 'basicstyles', items: [ 'Bold', 'Italic', 'Strike' ] }
	];
	
	/*config.toolbarGroups = [
		{ name: 'insert', groups: [ 'insert' ] },
		{ name: 'links', groups: [ 'link', 'links' ] },
		{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
		{ name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'paragraph' ] }
	];*/


	// Remove some buttons provided by the standard plugins, which are
	// not needed in the Standard(s) toolbar.
	config.removeButtons = 'Underline,Subscript,Superscript,Anchor,RemoveFormat';

	// Set the most common block elements.
	config.format_tags = 'p;h1;h2;h3;pre';

	// Simplify the dialog windows.
	config.removeDialogTabs = 'image:advanced;link:advanced';

	config.skin = 'bootstrapck';
	config.extraPlugins = 'autogrow,codesnippet,dialog,lineutils,filetools,uploadwidget,uploadimage,embed,embedbase,autolink,oembed,browseUploaded';
	config.autoGrow_minHeight = 450;
	config.autoGrow_maxHeight = 750;
	config.allowedContent = true;

	config.stylesSet = 'mystyles';


	// config.autoGrow_maxHeight = 1200;

};

