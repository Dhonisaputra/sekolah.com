$(document).delegate('.event-box', 'mouseenter', function(event){
    $(this).find('.event-date').addClass('rotate-20')
})
$(document).delegate('.event-box', 'mouseleave', function(event){
	$(this).find('.event-date').removeClass('rotate-20')
})