// draws the connections chart in the modal dialog for the selected country
function chartCountryConnections(countryCode){
	var barColors = [ ['Officer', "#A1D99B"], ['Intermediary', "#FC9272"], ['Entity', "#A6BDDB"] ];

	var url = requestUrl(window.apiEndPoints["connections_one_country"], window.selectedDate, null, countryCode, null);
	fetchData(url, function( data ) {
		obj = data[0];
		maxCount = Math.max.apply( Math, [obj.includes_entity, obj.includes_intermediary, obj.includes_officer]);
		console.log(maxCount, obj.includes_entity, obj.includes_intermediary, obj.includes_officer);
		console.log("chartCountryConnections", countryCode, obj, obj.country );
		$("#country-report-title").html("Total Connections for " + obj.country + ": " + addCommasToInteger(obj.total));
		$("#country-report-officer-bar").css({
			"width" : obj.includes_officer / maxCount * 250,
			"float" : "left",
			"margin" : "0px 4px 0px 4px",
			"height" : "14px",
			"backgroundColor" : "#a1d99b"
		});
		$("#country-report-officer-total").html(addCommasToInteger(obj.includes_officer));
		$("#country-report-intermediary-bar").css( {
			"width" : obj.includes_intermediary / maxCount * 250,
			"float" : "left",
			"margin" : "0px 4px 0px 4px",
			"height" : "14px",
			"backgroundColor" : "#fc9272"
		});
		$("#country-report-intermediary-total").html(addCommasToInteger(obj.includes_intermediary));
		$("#country-report-entity-bar").css({
			"width" : obj.includes_entity / maxCount * 250,
			"float" : "left",
			"margin" : "0px 4px 0px 4px",
			"height" : "14px",
			"backgroundColor" : "#a6bddb"
		});
		$("#country-report-entity-total").html(addCommasToInteger(obj.includes_entity));
	});

}