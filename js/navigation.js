function afterSlide(view) {
	console.log( "slidr in:", view );
	if( view == 'one'){
		$("#date-slider-container").slideUp();
		globalSlidr.controls('none');
	}else{
		$("#date-slider-container").slideDown();;
		globalSlidr.controls('border');
	}
	console.log( "slidr in display:", $("#date-slider-container").css("display") );
}

function beforeSlide(view) {
	console.log('sldr out: ' + view);
}

function circleClick(el,codeType ){
	code = $(el).attr("countryCode")
	console.log(codeType, code);
	
	$("#dialog-title-type").text(codeType);
	$("#dialog-title-code").text(code);
	$("#network-view").text( codeType + ' Placeholder: ' + code )
	drawGraph(code, 'country_code');
	chartCountryConnections(code);
	$("#myModal").modal();
}


function advanceToDetailView(){
	$("#myModal").modal("hide");
	globalSlidr.slide("three");
}

function requestUrl (endPoint, date, nodeId = null, countryCode = null, depth = null) {
	var selectedDateString = d3.time.format("%Y-%m-01")(date);
	console.log( "selectedDateString: ", selectedDateString );
	if( nodeId == null ) { node_id='0'; }
	if( countryCode == null ){ countryCode = ''; }
	if( window.inclOfficers == null ) { window.inclOfficers = false; }
	if( window.inclIntermediaries == null ) { window.inclIntermediaries = false; }
	if( depth == null ) { depth = 5; }
	var url= '//localhost:8080/' + endPoint.replace( "%selected_date%", selectedDateString )
										   .replace( "%node_id", nodeId )
										   .replace( "%country_code%", countryCode )
										   .replace( "%incl_officers%", (window.inclOfficers == true ? 'true' : 'false') )
										   .replace( "%incl_intermediaries%", (window.inclIntermediaries == true ? 'true' : 'false') )
										   .replace( "%max_recursions%", depth );
	console.log( "requestUrl: ",  url );
	return url;
}

function fetchData(apiUrl, callbackFunction) {
	console.log( "fetchData: ", apiUrl );
	$.getJSON(apiUrl, callbackFunction);	
}
