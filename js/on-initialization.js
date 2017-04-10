$(function(){
	$("#date-slider").css("display", "block").hide();
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

	$("#dialog-code").click(function(){
		advanceToDetailView()
	});


	$("#dialog").hide();

	function setElementWidth(desc){
		console.log("setElementWidth", desc);
		var elwidth = $(window).width();
		$("#title-image").css("max-width", elwidth);
		var styles = {
			width: elwidth,
			height: .4752 * elwidth,
			padding: "50px",
			"background-color": "#dfe5ac",
			"font-size":"16px"
		};
		$("#network-view-data").css(styles);
	}


	var width = Math.max(960, window.innerWidth),
		height = Math.max(500, 0.4752 * width),
		startColor = "#ff3399",
		endColor = "#ffcc00",
		linkColor = "#99ff33",
		dateSliderWidth = Math.round(width * 0.8),
		dateSliderHeight = 50,
		mapWidth = width,
		mapHeight = height,
		prefix = prefixMatch(["webkit", "ms", "Moz", "O"]);

	var tile = d3.geo.tile()
		.size([width, height]);

	var projection = d3.geo.mercator();

	var zoom = d3.behavior.zoom()
		.scale(1 << 11)
		.scaleExtent([1 << 9, 1 << 23])
		.translate([mapWidth / 2, mapHeight / 2])
		.on("zoom", zoomed);

	var map = d3.select("#data-map").append("div")
		.attr("class", "map")
		.style("width", mapWidth + "px")
		.style("height", mapHeight + "px")
		.call(zoom);

	// Basemap layer
	var layer = map.append("div")
		.attr("class", "layer");

	// Selected Date layer
	var selectedDateLayer = map.append("div")
		.attr("class", "selected-date")
		.style("left", ((width - 100) / 2) + "px");

	// Data layer
	var svg = map.append("svg")
		.attr("class", "layer")
		.attr("width", mapWidth)
		.attr("height", mapHeight);

	// Date slider
	window.sliderPanel = d3.select("#date-slider")
		.append("svg")
		.attr("width", width)
		.attr("height", dateSliderHeight)
		.append("g")
		.attr("transform", "translate(" + (width - dateSliderWidth) / 2 + "," + 0 + ")");

	var info = map.append("div")
		.attr("class", "info");

	var maxDate = maxDate || new Date(0);
	var minDate = minDate || new Date();
	var selectedDate = selectedDate || new Date('2016-12-01');

	if (window.connectionCountArray.length == 0)
		d3.csv('connection_count.csv', function(data) {
			data.forEach(function(v) {
				var monthStartDate = new Date(v.date);
				maxDate = (monthStartDate > maxDate) ? monthStartDate : maxDate;
				minDate = (monthStartDate < minDate) ? monthStartDate : minDate;
				window.connectionCountArray.push({
					monthDate: monthStartDate,
					includesEntity: parseInt(v.includes_entity),
					includesOfficer: parseInt(v.includes_officer),
					includesIntermediary: parseInt(v.includes_intermediary),
					total: parseInt(v.includes_entity) + parseInt(v.includes_officer) + parseInt(v.includes_intermediary)
				});
			});
			selectedDate = maxDate;
			setUpDateSlider(minDate, maxDate);
		});

	var selectedDateString = function(date) { return d3.time.format("%Y-%m-01")(date); }

	console.log("spinner", "on");
	document.getElementById("loader").style.display = "block";
	var baseUrl = '//localhost:5000';

	// Each of the following paths will be set based on the combination of selections made
	// on the page, which can be either the map view or the detail view.

	var apiPath = function(endPoint, date) {
		return '/' + endPoint + '/' + selectedDateString(date);
	}
	var edgeTypePath = function(nodeId = null, countryCode = null) {
		// TODO: edgeTypePath will look like /nodeid/12345 when a specific node is selected
		//       or /countrycode/PAN when a specific country is selected
		return '';
	}
	var nodeTypePath = function(includesOfficers = true, includesIntermediaries = true) {
		// TODO: true/false will be set based on selected checkboxes
		return '/incl_officers/' +
		       (includesOfficers == true ? 'true' : 'false') +
		       '/incl_intermediaries/' +
		       (includesIntermediaries == true ? 'true' : 'false');
	}
	var depthPath = function(depth = null) {
		// TODO: depthPath will look like /maxrecursions/5 when an API endpoint other than
		//       /edges_all_countries_json is called
		return '';
	}


	var requestUrl = function(endPoint, date, nodeId = null, countryCode = null, includesOfficers = true, includesIntermediaries = true, depth = null) {
		return baseUrl +
		apiPath(endPoint, date) +
		edgeTypePath(nodeId, countryCode) +
		nodeTypePath(includesOfficers, includesIntermediaries) +
		depthPath(depth);
	}
	var dataArray = [];

	// Data galore!
	function fetchData(apiUrl, callbackFunction) {
		$.getJSON(apiUrl, callbackFunction);
	}

	function setUpDateSlider(minDate, maxDate) {
		// setup our brush as slider for date selection
		var sliderHeightOffset = dateSliderHeight / 2;
		window.sliderX = d3.time.scale()
		    .domain([minDate, maxDate])
		    .range([0, dateSliderWidth])
		    .clamp(true);

		window.dateBrush = d3.svg.brush()
		    .x(sliderX)
		    .extent([sliderX.domain()[0],sliderX.domain()[0]])
		    .on("brush", brushed)
		    .on("brushend",brushended);

		sliderPanel.append("g")
		    .attr("class", "slider-x axis")
		    .attr("transform", "translate(0," + sliderHeightOffset + ")")
		    .call(d3.svg.axis()
			.scale(window.sliderX)
			.orient("bottom")
			.ticks(d3.time.years)
			.tickFormat(d3.time.format("%Y")))
			.select(".domain")
			.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
		    .attr("class", "halo");

		window.slider = sliderPanel.append("g")
		    .attr("class", "date-slider")
		    .call(dateBrush);

		slider.selectAll(".extent,.resize")
		    .remove();

		slider.select(".background")
		    .attr("height", height);

		window.dateSliderHandle = slider.append("circle")
		    .attr("class", "date-slider-handle")
		    .attr("transform", "translate(0," + sliderHeightOffset + ")")
		    .attr("r", 9);

		// Slider handlers
		var brushTimer;
		function brushedValue(target, event) {
			var value;

			if (typeof window.dateBrush.extent() !== "undefined") {
				value = window.dateBrush.extent()[0];
				console.log(value);

				if (event) { // not a programmatic event
					value = d3.time.day.offset(d3.time.month.round(window.sliderX.invert(d3.mouse(target)[0])),-1);

					window.dateBrush.extent([value, value]);
				}
			} else {
				value = window.sliderX.domain()[0];
			}

			return value;
		}

		function brushed() {
			var value;
			var target = this;
			var endEvent = d3.event.sourceEvent;

			window.dateSliderHandle.attr("cx", window.sliderX(brushedValue(this, endEvent)));
		};

		function brushended() {
			var value;
			var target = this;
			var endEvent = d3.event.sourceEvent;
			var v = brushedValue(target, endEvent);
			updateMap(v);
		}
	}

	function updateMap( value ) {
		selectedDate = value;
		selectedDateLayer.style("left", (width - 100) / 2).html(d3.time.format("%b %Y")(selectedDate));
		var url = requestUrl(window.apiEndPoints[0], selectedDate, null, null, true, true, null);
		fetchData(url, function( data ) {
			dataArray = data;
			zoomed();
		});
	}

	// Initial data fetch on load.
	var initialRequestUrl = requestUrl(window.apiEndPoints[0], selectedDate, null, null, true, true, null);
	fetchData(initialRequestUrl, function( data ) {
		dataArray = data;

		document.getElementById("loader").style.display = "none";
		console.log("spinner", "off");
		zoomed();

		window.dateSliderHandle.attr("cx", window.sliderX(selectedDate));
		updateMap(selectedDate);
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
			var startCoordinates = projection([parseFloat(v.x1), parseFloat(v.y1)]);
			var endCoordinates = projection([parseFloat(v.x2), parseFloat(v.y2)]);
			var monthDate = new Date(v.date);

			startArray.push({
				countryCode: v.country_code_1,
				countryName: v.country_1,
				longitude: v.x1,
				latitude: v.y1,
				x: startCoordinates[0],
				y: startCoordinates[1],
				monthDate: monthDate
			});
			endArray.push({
				countryCode: v.country_code_2,
				countryName: v.country_2,
				longitude: v.x2,
				latitude: v.y2,
				x: endCoordinates[0],
				y: endCoordinates[1],
				monthDate: monthDate
			});
			edgeArray.push({
				startX: startCoordinates[0],
				startY: startCoordinates[1],
				endX: endCoordinates[0],
				endY: endCoordinates[1],
				monthDate: monthDate
			});
		});

		// Draw data points and links
		drawData(startArray, endArray, edgeArray);
	}

	function drawData(startPoints, endPoints, connections) {
		svg.selectAll("circle.start-circle").remove();
		svg.selectAll("circle.end-circle").remove();
		svg.selectAll("path.edge").remove();
		svg.selectAll("circle.start-circle").data(startPoints).enter().append("circle")
			.attr("class", "start-circle")
			.attr("r", 10)
			.attr("fill", startColor)
			.attr("title", "Country")
			.attr("data-toggle", "modal")
			.attr("data-target", "#modalDI")
			.attr("countryCode", function (d){ return d.countryCode; })
			.attr("cx", function (d){ return d.x; })
			.attr("cy", function (d){ return d.y; })
			.attr("onclick", "circleClick(this, 'Country')");

			svg.selectAll("circle.end-circle").data(endPoints).enter().append("circle")
			.attr("class", "end-circle")
			.attr("r", 5)
			.attr("fill", endColor)
			.attr("title", "Country")
			.attr("countryCode", function (d){ return d.countryCode; })
			.attr("cx", function (d){ return d.x; })
			.attr("cy", function (d){ return d.y; })
			.attr("onclick", "circleClick(this, 'Country')");

		svg.selectAll("path.edge").data(connections).enter().append("path")
			.attr("class", "edge")
			.attr("d", function(d) {
	    var sx = d.startX, sy = d.startY,
	        tx = d.endX, ty = d.endY,
	        dx = tx - sx, dy = ty - sy,
	        dr = 2 * Math.sqrt(dx * dx + dy * dy);
			return "M" + sx + "," + sy + "A" + dr + "," + dr + " 0 0,1 " + tx + "," + ty;
		});

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
