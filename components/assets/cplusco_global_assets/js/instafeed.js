$(document).ready(function(){
	$('.instagram-feed-container').socialfeed({
		 instagram:{
            accounts: ['@dhonipsaputra'],  //Array: Specify a list of accounts from which to pull posts
            limit: 5,                                    //Integer: max number of posts to load
            client_id: '445b8f3f0a5e41d485d71d2c25768b0a',       //String: Instagram client id (optional if using access token)
            access_token: '1198528209.445b8f3.48c92b920a224384bb3f76ff13b621a9' //'2077408365.88293d2.d88b8324cb2747168ef82eb4986479fd' //String: Instagram access token // get from here -> https://www.instagram.com/oauth/authorize/?client_id=88293d2d284141c4b5fa02afc42e2f46&redirect_uri=http://www.laboratorium.xyz&response_type=token&scope=public_content
        },
        // GENERAL SETTINGS
        template : 'instafeed_template.html',					//  Source of your template
        length:50,                                      //Integer: For posts with text longer than this length, show an ellipsis.
        onRenderTemplate: function(ui, data)
        {
        		switch(data.social_network)
            	{
            		case "instagram":
            			var comments_length = 0
            			if(data.raw.comments)
            			{
            				comments_length = data.raw.comments.count
            			}
    					$('#instagram_'+data.id+' .comment-length').html(comments_length)
    					$('#instagram_'+data.id+' .news-media').css('background-image', 'url("'+data.raw.images.low_resolution.url+'")');

            			break;
            	}
        },
        callback: function(data)
        {

        	$('.instagram-feed-container').slick({
				slidesToShow: 4,
			    slidesToScroll: 4,
			    arrows: false,
			    infinite: false,
			    autoplay: true,
        autoplaySpeed: 3000,
			  	responsive: [
			      {
			        breakpoint: 1280,
			        settings: {
			          slidesToShow: 3,
			          slidesToScroll: 3,
			        }
			      },
			      {
			        breakpoint: 600,
			        settings: {
			          slidesToShow: 2,
			          slidesToScroll: 2
			        }
			      },
			      {
			        breakpoint: 480,
			        settings: {
			          slidesToShow: 1,
			          slidesToScroll: 1
			        }
			      }
			      // You can unslick at a given breakpoint now by adding:
			      // settings: "unslick"
			      // instead of a settings object
			    ]
        	});
        },
    });
})
