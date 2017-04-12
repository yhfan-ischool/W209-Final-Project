// startig point for the detailed view graph
function drawGraph(code, code_type){
	// read the checkboxes
	var includes_officers = $("#chk-officer").is(":checked");
	var includes_intermediaries = $("#chk-intermediary").is(":checked");
	var url = requestUrl(window.apiEndPoints[code_type], window.selectedDate, code, code, includes_officers, includes_intermediaries, null);
	var s = "";
	fetchData(url, function( data ) {
		for(var i=0;i<data.length;i++) {
			s += "{ <br/>" + 
				 "&nbsp;&nbsp;node1_name : " + data[i].node1_name + '<br/>' +
			     "&nbsp;&nbsp;node2_name : " + data[i].node2_name + '<br/>' +
				 "&nbsp;&nbsp;rel_type : " + data[i].rel_type + '<br/>' +
				 "&nbsp;&nbsp;date : " + data[i].date + '<br/>' +
				 "&nbsp;&nbsp;node_id1 : " + data[i].node_id1 + '<br/>' +
				 "&nbsp;&nbsp;node+type_1 : " + data[i].node_type_1 + '<br/>' +
				 "&nbsp;&nbsp;country_code_1 : " + data[i].country_code_1 + '<br/>' +
				 "&nbsp;&nbsp;node_id2 : " +data[i].node_id2 + '<br/>' +
				 "&nbsp;&nbsp;node_type_2 : " + data[i].node_type_2 + '<br/>' +
				 "&nbsp;&nbsp;country_code_2 : " + data[i].country_code_2 + '<br/>' +
				 "&nbsp;&nbsp;includes_entity : " + data[i].includes_entity + '<br/>' +
				 "&nbsp;&nbsp;includes_officer : " + data[i].includes_officer + '<br/>' +
				 "&nbsp;&nbsp;includes_intermediary : " + data[i].includes_intermediary + '<br/>' +
				 "&nbsp;&nbsp;weight : " + data[i].weight + '<br/>' +
				"}"			 
		}
		$("#network-view").html(s);
	});
	
}