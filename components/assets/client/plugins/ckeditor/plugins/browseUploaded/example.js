var config = {
	codeSnippet_theme: 'monokai_sublime',
	uploadUrl: F_Config.server_url('files/upload_file'),
	filebrowserUploadUrl: F_Config.server_url('files/ckeditor_upload_file'),
	filebrowserBrowseUrl: '#/choose/images',
	urlBrowseUploaded:
	{
		url: '#/choose/images',
		width: 800,
		height: 500
	}
};
$('[name="content"]').ckeditor(config);