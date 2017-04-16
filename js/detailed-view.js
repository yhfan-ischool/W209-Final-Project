// starting point for the detailed view graph
function drawGraph(code, code_type){
	var width = Math.max(960, window.innerWidth),
		height = Math.max(500, 0.4752 * width);

	// read the checkboxes
	var url = requestUrl(window.apiEndPoints[code_type], window.selectedDate, code, code, null);
	var s = "";
	fetchData(url, function( data ) {
		var dataCollection = {},
            links = [];

		data.forEach(function(d) {
			var key1 = [d.node_type_1, d.node_id1].join('_'),
			    key2 = [d.node_type_2, d.node_id2].join('_');
			var node1 = dataCollection[key1],
			    node2 = dataCollection[key2];

			if (node1 == null) {
				node1 = {
					id: d.node_id1,
					type: d.node_type_1,
					country_code: d.country_code_1 == null ? 'N/A': d.country_code_1,
					country_name: d.country_code_1 == null ? 'N/A': window.countryLookupTable[d.country_code_1],
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
					country_code: d.country_code_2 == null ? 'N/A' : d.country_code_2,
					country_name: d.country_code_2 == null ? 'N/A' : window.countryLookupTable[d.country_code_2],
					name: d.node2_name,
					connectors: []
				};
			}

			if (node2.target == null) {
				node2.connectors.push(node2.target = { node: node2, degree: 0, type: d.node_type_2 });
			}
			
			links.push({source: node1.source, target: node2.target, relation_type: d.rel_type});
			
			dataCollection[key1] = node1;
			dataCollection[key2] = node2;

		});

		var nodes = $.map(dataCollection, function(el) { return el });
        drawHive('#network-view', width, height, ['Entity', 'Officer', 'Intermediary'], nodes, links, 'country_code');

	});
	
}