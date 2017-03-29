$(function(){
	$(window).on("load", function () {
		setElementWidth("load");
	});
	$("#title-image").on("load", function () {
		setElementWidth("title-image load");
	});
	// window resize handler
	$(window).on("resize", function () {
		setElementWidth("resize");
	});
	function setElementWidth(desc){
		console.log("setElementWidth", desc);
		var elwidth = $(window).width();
		$("#title-image").css("max-width", elwidth);		
	}
	
	var width = Math.max(960, window.innerWidth),
		height = Math.max(500, window.innerHeight),
		startColor = "#ff3399",
		endColor = "#ffcc00",
		linkColor = "#99ff33",
		prefix = prefixMatch(["webkit", "ms", "Moz", "O"]);

	var tile = d3.geo.tile()
		.size([width, height]);

	var projection = d3.geo.mercator();

	var zoom = d3.behavior.zoom()
		.scale(1 << 11)
		.scaleExtent([1 << 9, 1 << 23])
		.translate([width / 2, height / 2])
		.on("zoom", zoomed);

	var map = d3.select("#slidr-map").append("div")
		.attr("class", "map")
		.style("width", width + "px")
		.style("height", height + "px")
		.call(zoom);

	var layer = map.append("div")
		.attr("class", "layer");

	var svg = map.append("svg")
		.attr("class", "layer")
		.attr("width", width)
		.attr("height", height);

	var info = map.append("div")
		.attr("class", "info");
	
	console.log("spinner", "on");
	document.getElementById("loader").style.display = "block";
	var dataArray = [];
	$.getJSON("//localhost:8080/associations", function( data ) {
		dataArray = data;

		document.getElementById("loader").style.display = "none";
		console.log("spinner", "off");
		zoomed();
	});

	setElementWidth("ready");
	zoomed();

	function zoomed() {
	  var tiles = tile
		  .scale(zoom.scale())
		  .translate(zoom.translate())
		  ();

	  projection
		  .scale(zoom.scale() / 2 / Math.PI)
		  .translate(zoom.translate());

	  // Draw the base map
	  var image = layer
		  .style(prefix + "transform", matrix3d(tiles.scale, tiles.translate))
		  .selectAll(".tile")
		  .data(tiles, function(d) { return d; });

	  image.exit()
		   .remove();

	  image.enter().append("img")
		  .attr("class", "tile")
		  .attr("src", function(d) { return "http://" + ["a", "b", "c"][Math.random() * 3 | 0] + ".tile.openstreetmap.org/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
		  .style("left", function(d) { return (d[0] << 8) + "px"; })
		  .style("top", function(d) { return (d[1] << 8) + "px"; });

	  // Draw the graticule
	  var path = d3.geo.path()
		  .projection(projection);

	  var graticule = d3.geo.graticule();

	  svg.selectAll("path.graticule").remove();

	  svg.append("path")
		  .datum(graticule)
		  .attr("class", "graticule")
		  .attr("d", path);

	  // Project data's lat/lon to map's coordinates
	  var startArray = [];
	  var endArray = [];
	  var edgeArray = [];

	  dataArray.forEach(function(v) {
		  var startCoordinates = projection([parseFloat(v.start_x), parseFloat(v.start_y)]);
		  var endCoordinates = projection([parseFloat(v.end_x), parseFloat(v.end_y)]);

		  startArray.push({
			countryCode: v.start_country_code,
			countryName: v.start_country_name,
			longitude: v.start_x,
			latitude: v.start_y,
			x: startCoordinates[0],
			y: startCoordinates[1]
		  });
		  endArray.push({
			countryCode: v.end_country_code,
			countryName: v.end_country_name,
			longitude: v.end_x,
			latitude: v.end_y,
			x: endCoordinates[0],
			y: endCoordinates[1]
		  });
		  edgeArray.push({
			startX: startCoordinates[0],
			startY: startCoordinates[1],
			endX: endCoordinates[0],
			endY: endCoordinates[1]
		  });
	  });

	  // Draw data points and links
	  svg.selectAll("circle.start-circle").remove();
	  svg.selectAll("circle.end-circle").remove();
	  svg.selectAll("line.edge").remove();
	  svg.selectAll("circle.start-circle").data(startArray).enter().append("circle")
		 .attr("class", "start-circle")
		 .attr("r", 10)
		 .attr("fill", startColor)
		 .attr("cx", function (d){ return d.x; })
		 .attr("cy", function (d){ return d.y; });
	  svg.selectAll("circle.end-circle").data(endArray).enter().append("circle")
		 .attr("class", "end-circle")
		 .attr("r", 5)
		 .attr("fill", endColor)
		 .attr("cx", function (d){ return d.x; })
		 .attr("cy", function (d){ return d.y; });

	  svg.selectAll("line.edge").data(edgeArray).enter().append("line")
		 .attr("class", "edge")
		 .attr("r", 4)
		 .attr("stroke", linkColor)
		 .attr("stroke-width", "1px")
		 .attr("x1", function (d){ return d.startX; })
		 .attr("y1", function (d){ return d.startY; })
		 .attr("x2", function (d){ return d.endX; })
		 .attr("y2", function (d){ return d.endY; });
	}

	function matrix3d(scale, translate) {
		var k = scale / 256, r = scale % 1 ? Number : Math.round;
		return "matrix3d(" + [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, r(translate[0] * scale), r(translate[1] * scale), 0, 1 ] + ")";
	}

	function prefixMatch(p) {
		var i = -1, n = p.length, s = document.body.style;
		while (++i < n) if (p[i] + "Transform" in s) return "-" + p[i].toLowerCase() + "-";
		return "";
	}
	
	
});