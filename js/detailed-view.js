// starting point for the detailed view graph
function drawGraph(code, code_type) {
    var width = Math.max(960, window.innerWidth),
        height = Math.max(500, 0.4752 * width);

    // Display the inside/outside country legend.
    var groupingLegend = $("div.hive-grouping-legend-container");
    if (groupingLegend.length > 0) {
        d3.select("#network-view")
            .selectAll("div.hive-grouping-legend-container")
            .remove();
    }
    groupingLegend = d3.select("#network-view")
        .append("div")
        .attr("class", "hive-grouping-legend-container")
        .html("<table>" +
            "       <tr>" +
            "           <td class='hive-grouping-legend inside-group'></td>" +
            "           <td> Inside of " + window.countryLookupTable[window.selectedCountry] + "</td>" +
            "       </tr>" +
            "</table>" +
            "<table>" +
            "       <tr>" +
            "           <td class='hive-grouping-legend outside-group'></td>" +
            "           <td> Outside of " + window.countryLookupTable[window.selectedCountry] + "</td>" +
            "       </tr>" +
            "</table>")
        .style("position", "absolute")
        .style("left", "20px")
        .style("top", "20px")
        .style("z-index", 10)
        .style("opacity", 1);

    // Display the axes labels.
    var axisLabel = $("div.hive-axis-label");
    if (axisLabel.length > 0) {
        d3.select("#network-view")
            .selectAll("div.hive-axis-label")
            .remove();
    }
    d3.select("#network-view")
        .append("div")
        .attr("class", "hive-axis-label")
        .style("left", "60px")
        .style("top", (0.41 * height - 30) + "px")
        .style("color", "#A6BDDB")
        .html("<h3>Entities</h3>");

    if (window.inclIntermediaries == true) {
        d3.select("#network-view")
            .append("div")
            .attr("class", "hive-axis-label")
            .style("left", 0.55 * width + "px")
            .style("top", "20px")
            .style("color", "#FC9272")
            .html("<h3>Intermediaries</h3>");
        if (window.inclOfficers == true) {
            d3.select("#network-view")
                .append("div")
                .attr("class", "hive-axis-label")
                .style("left", 0.55 * width + "px")
                .style("top", (height - 90) + "px")
                .style("color", "#A1D99B")
                .html("<h3>Officers</h3>");
        }
    } else {
        if (window.inclOfficers == true) {
            d3.select("#network-view")
                .append("div")
                .attr("class", "hive-axis-label")
                .style("left", 0.55 * width + "px")
                .style("top", "20px")
                .style("color", '#A1D99B')
                .html("<h3>Officers</h3>");
        } else {
            d3.select("#network-view")
                .append("div")
                .attr("class", "hive-axis-label")
                .style("left", 0.55 * width + "px")
                .style("top", "20px")
                .style("color", "#FC9272")
                .html("<h3>Intermediaries</h3>");
            d3.select("#network-view")
                .append("div")
                .attr("class", "hive-axis-label")
                .style("left", 0.55 * width + "px")
                .style("top", (height - 90) + "px")
                .style("color", "#A1D99B")
                .html("<h3>Officers</h3>");
        }
    }

    // read the checkboxes
    var url = requestUrl(window.apiEndPoints[code_type], window.selectedDate, code, code, null);
    var s = "";
    fetchData(url, function (data) {
        var dataCollection = {},
            links = [];

        data.forEach(function (d) {
            var key1 = [d.node_type_1, d.node_id1].join('_'),
                key2 = [d.node_type_2, d.node_id2].join('_');
            var node1 = dataCollection[key1],
                node2 = dataCollection[key2];

            if (node1 == null) {
                node1 = {
                    id: d.node_id1,
                    type: d.node_type_1,
                    country_code: d.country_code_1 == null ? 'N/A' : d.country_code_1,
                    country_name: d.country_code_1 == null ? 'N/A' : window.countryLookupTable[d.country_code_1],
                    name: d.node1_name,
                    grouping: d.country_code_1 == window.selectedCountry ? 'inside' : 'outside',
                    connectors: []
                };
            }

            if (node1.source == null) {
                node1.connectors.push(node1.source = {node: node1, degree: 0, type: d.node_type_1});
            }

            if (node2 == null) {
                node2 = {
                    id: d.node_id2,
                    type: d.node_type_2,
                    country_code: d.country_code_2 == null ? 'N/A' : d.country_code_2,
                    country_name: d.country_code_2 == null ? 'N/A' : window.countryLookupTable[d.country_code_2],
                    name: d.node2_name,
                    grouping: d.country_code_2 == window.selectedCountry ? 'inside' : 'outside',
                    connectors: []
                };
            }

            if (node2.target == null) {
                node2.connectors.push(node2.target = {node: node2, degree: 0, type: d.node_type_2});
            }

            links.push({source: node1.source, target: node2.target, relation_type: d.rel_type});

            dataCollection[key1] = node1;
            dataCollection[key2] = node2;

        });

        var nodes = $.map(dataCollection, function (el) {
            return el
        });
        drawHive('#network-view', width, height, ['Entity', 'Officer', 'Intermediary'], nodes, links, 'country_code');

    });

}