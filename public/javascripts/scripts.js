$(document).ready(function(){
	var tallestPoster = 0;
	$('.movies .col-sm-3').each(function(){ // Have to use function() because we are calling "$(this)"
		var curElement = $(this);
		// console.log(curElement.height());
		if(curElement.height() > tallestPoster){
			tallestPoster = curElement.height();
		}
	});
	$('.movies .col-sm-3').height(tallestPoster);
});