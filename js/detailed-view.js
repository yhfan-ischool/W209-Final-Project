// startig point for the detailed view graph
function drawGraph(code, code_type){
	var width = Math.max(960, window.innerWidth),
		height = Math.max(500, 0.4752 * width);

	// read the checkboxes
	var includes_officers = $("#chk-officer").is(":checked");
	var includes_intermediaries = $("#chk-intermediary").is(":checked");
	var url = requestUrl(window.apiEndPoints[code_type], window.selectedDate, code, code, includes_officers, includes_intermediaries, null);
	var s = "";
	fetchData(url, function( data ) {
		var dataCollection = {},
            links = [],
            defaultInfo;

		data.forEach(function(d) {
			var key1 = [d.node_type_1, d.node_id1].join('_'),
			    key2 = [d.node_type_2, d.node_id2].join('_');
			var node1 = dataCollection[key1],
			    node2 = dataCollection[key2];

			if (node1 == null) {
				node1 = {
					id: d.node_id1,
					type: d.node_type_1,
					country_code: d.country_code_1,
					name: d.node1_name,
					connectors: []
				};
			}

			if (node1.source == null) {
				node1.connectors.push(node1.source = { node: node1, degree: 0, type: d.node_type_1 });
			}
			
			if (node2 == null) {
				node2 = {
					id: d.node_id2,
					type: d.node_type_2,
					country_code: d.country_code_2,
					name: d.node2_name,
					connectors: []
				};
			}

			if (node2.target == null) {
				node2.connectors.push(node2.target = { node: node2, degree: 0, type: d.node_type_2 });
			}
			
			links.push({source: node1.source, target: node2.target});
			
			dataCollection[key1] = node1;
			dataCollection[key2] = node2;

		});

		var nodes = $.map(dataCollection, function(el) { return el });
        drawHive('#network-view', '#network-view-data', width, height, ['Entity', 'Officer', 'Intermediary'], nodes, links, 'country_code');

		// for(var i=0;i<data.length;i++) {
		// 	s += "{ <br/>" + 
		// 		 "&nbsp;&nbsp;node1_name : " + data[i].node1_name + '<br/>' +
		// 	     "&nbsp;&nbsp;node2_name : " + data[i].node2_name + '<br/>' +
		// 		 "&nbsp;&nbsp;rel_type : " + data[i].rel_type + '<br/>' +
		// 		 "&nbsp;&nbsp;date : " + data[i].date + '<br/>' +
		// 		 "&nbsp;&nbsp;node_id1 : " + data[i].node_id1 + '<br/>' +
		// 		 "&nbsp;&nbsp;node_type_1 : " + data[i].node_type_1 + '<br/>' +
		// 		 "&nbsp;&nbsp;country_code_1 : " + data[i].country_code_1 + '<br/>' +
		// 		 "&nbsp;&nbsp;node_id2 : " +data[i].node_id2 + '<br/>' +
		// 		 "&nbsp;&nbsp;node_type_2 : " + data[i].node_type_2 + '<br/>' +
		// 		 "&nbsp;&nbsp;country_code_2 : " + data[i].country_code_2 + '<br/>' +
		// 		 "&nbsp;&nbsp;includes_entity : " + data[i].includes_entity + '<br/>' +
		// 		 "&nbsp;&nbsp;includes_officer : " + data[i].includes_officer + '<br/>' +
		// 		 "&nbsp;&nbsp;includes_intermediary : " + data[i].includes_intermediary + '<br/>' +
		// 		 "&nbsp;&nbsp;weight : " + data[i].weight + '<br/>' +
		// 		"}"			 
		// }
		// $("#network-view-data-debug").html(s);
	});
	
}