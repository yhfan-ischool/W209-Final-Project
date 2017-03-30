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
		dateSliderWidth = Math.round(width * 0.8),
		dateSliderHeight = 50,
		mapWidth = width,
		mapHeight = height - dateSliderHeight,
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
	var sliderPanel = d3.select("#date-slider")
		.append("svg")
		.attr("width", width)
		.attr("height", dateSliderHeight)
		.append("g")
		.attr("transform", "translate(" + (width - dateSliderWidth) / 2 + "," + 0 + ")");

	var info = map.append("div")
		.attr("class", "info");

	// Data galore!
	var dataArray = [];
	var selectedDate = new Date();

	console.log("spinner", "on");
	document.getElementById("loader").style.display = "block";
	$.getJSON("//localhost:8080/associations", function( data ) {
		dataArray = data;
		var minDate = new Date();

		dataArray.forEach(function(v) {
		var vDate = new Date(v.start_date);
		if (vDate < minDate) {
		    minDate = vDate;
		}
    });

	document.getElementById("loader").style.display = "none";
	console.log("spinner", "off");
	zoomed();

    // setup our brush as slider for date selection
    var sliderHeightOffset = dateSliderHeight / 2;
    var sliderX = d3.time.scale()
        .domain([minDate, new Date()])
        .range([0, dateSliderWidth])
        .clamp(true);

    brush = d3.svg.brush()
        .x(sliderX)
        .extent([sliderX.domain()[0],sliderX.domain()[0]])
        .on("brush", brushed)
        .on("brushend",brushended);

    sliderPanel.append("g")
        .attr("class", "slider-x axis")
        .attr("transform", "translate(0," + sliderHeightOffset + ")")
        .call(d3.svg.axis()
		.scale(sliderX)
		.orient("bottom")
		.ticks(d3.time.years)
		.tickFormat(d3.time.format("%Y")))
		.select(".domain")
		.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "halo");

    var slider = sliderPanel.append("g")
        .attr("class", "date-slider")
        .call(brush);

    slider.selectAll(".extent,.resize")
        .remove();

    slider.select(".background")
        .attr("height", height);

    var handle = slider.append("circle")
        .attr("class", "date-slider-handle")
        .attr("transform", "translate(0," + sliderHeightOffset + ")")
        .attr("r", 9);

    // Slider handlers
    function brushed() {
		var value;

		if (typeof brush.extent() !== "undefined") {
			value = brush.extent()[0];

			if (d3.event.sourceEvent) { // not a programmatic event
				value = d3.time.day.offset(d3.time.month.round(sliderX.invert(d3.mouse(this)[0])),-1);
				brush.extent([value, value]);
			}
		} else {
			value = sliderX.domain()[0];
		}

		updateMap( value );
		handle.attr("cx", sliderX(value));
    }

    function brushended() {
      // This does nothing for now.
    }

    function updateMap( value ) {
		selectedDate = value;
		selectedDateLayer.style("left", (width - 100) / 2).html(d3.time.format("%Y-%m-%d")(selectedDate));
		zoomed();
    }

    handle.attr("cx", sliderX(selectedDate));
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
			var startCoordinates = projection([parseFloat(v.start_x), parseFloat(v.start_y)]);
			var endCoordinates = projection([parseFloat(v.end_x), parseFloat(v.end_y)]);

			var startDate = new Date(v.start_date);
			var endDate = new Date(v.end_date);

			if (startDate <= selectedDate && (v.end_date == "None" || endDate > selectedDate)) {
				startArray.push({
					countryCode: v.start_country_code,
					countryName: v.start_country_name,
					longitude: v.start_x,
					latitude: v.start_y,
					x: startCoordinates[0],
					y: startCoordinates[1],
					startDate: startDate,
					endDate: endDate
				});
				endArray.push({
					countryCode: v.end_country_code,
					countryName: v.end_country_name,
					longitude: v.end_x,
					latitude: v.end_y,
					x: endCoordinates[0],
					y: endCoordinates[1],
					startDate: startDate,
					endDate: endDate
				});
				edgeArray.push({
					startX: startCoordinates[0],
					startY: startCoordinates[1],
					endX: endCoordinates[0],
					endY: endCoordinates[1],
					startDate: startDate,
					endDate: endDate
				});
			}
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
			.attr("cx", function (d){ return d.x; })
			.attr("cy", function (d){ return d.y; });
		svg.selectAll("circle.end-circle").data(endPoints).enter().append("circle")
			.attr("class", "end-circle")
			.attr("r", 5)
			.attr("fill", endColor)
			.attr("cx", function (d){ return d.x; })
			.attr("cy", function (d){ return d.y; });

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