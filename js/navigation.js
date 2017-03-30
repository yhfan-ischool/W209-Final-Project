function afterSlide(view) {
	console.log( "slidr in:", view );
	if( view == 'one'){
		$("#date-slider").slideUp();
		globalSlidr.controls('none');
	}else{
		$("#date-slider").slideDown();;
		globalSlidr.controls('border');
	}
	console.log( "slidr in:", $("#date-slider").css("display") );
}

function beforeSlide(view) {
	console.log('sldr out: ' + view);
}

function circleClick(el,codeType ){
	code = $(el).attr("countryCode")
	console.log(codeType, code);
	
	$("#dialog-title").text(codeType);
	$("#dialog-code").text('Click on the code: ' + code);
	$("#network-view-data").text( codeType + ' Placeholder: ' + code )
	$("#myModal").modal();
}

function advanceToDetailView(){
	$("#myModal").modal("hide");
	globalSlidr.slide("three");
}