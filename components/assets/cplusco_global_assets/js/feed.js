$(document).ready(function(){
	$('.social-feed-container').socialfeed({
		facebook:{
	        accounts: ['@badminton.cplusco'],  //Array: Specify a list of accounts from which to pull wall posts
	        limit: 15,                                   //Integer: max number of posts to load
	        access_token: '1519286481659615|f107fae6b7e7e763dace587c6685d9a6',  //String: "APP_ID|APP_SECRET"
	        overwrite_fields: true,
	        fields: {
	        	posts: {
	        		parameters: ['comments, permalink_url, full_picture','id','from','name','message','created_time','story','description','link'],
	        		limit: 15
	        	}
	        },
	    },

	    weibo: 
	    {
	    	access_token: '2.00mfvCiG69Q7gD6fa5af858cIkMXaB',
	    	app_key : '3375264401',
	    	method: 'statuses/friends_timeline.json',
	    	parameters: {
	    		uid: '6147654130',
	    	}  
	    },
        // GENERAL SETTINGS
        template : 'buzzfeed_template.html',			//  Source of your template
        length:50,                                      //Integer: For posts with text longer than this length, show an ellipsis.
        onRenderTemplate: function(ui, data)			// fire function when each data rendered as html
        {
        		switch(data.social_network)
            	{
            		case "facebook":
            			var comments_length = 0
            			if(data.raw.comments)
            			{
            				comments_length = data.raw.comments.data.length
            			}
    					$('#facebook_'+data.id+' .comment-length').html(comments_length)
	    					if (!data.raw.full_picture) {
	    						$('#facebook_'+data.id+' .news-media').remove();
	    					} else {
		    					$('#facebook_'+data.id+' .news-media').css('background-image', 'url("'+data.raw.full_picture+'")');
	    					}

            			break;
            		case "weibo":
            			var comments_length = 0
            			if(data.raw.comments_count)
            			{
            				comments_length = data.raw.comments_count
            			}
    					$('#weibo_'+data.id+' .comment-length').html(comments_length)
    						if (!data.raw.original_pic) {
	    						$('#weibo_'+data.id+' .news-media').remove();
	    					} else {
    							$('#weibo_'+data.id+' .news-media').css('background-image', 'url("'+data.raw.original_pic+'")');
	    					}

            			break;
            	}
        },
        callback: function(data)				// fire function when all data completely collected
        {

        	console.log(data);
        	$('.social-feed-container').slick({
				slidesToShow: 4,
			    slidesToScroll: 4,
			    arrows: false,
			    dots:true,
			    infinite: false,
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