function addCommasToInteger(number) {
  var q = Math.floor(number / 1000);
  if (q == 0)
    return number.toString();
  var result = (number - 1000 * q).toString();
  var shiftedNumber = q;
  var c = 3;
  while (q > 0) {
    q = Math.floor(shiftedNumber / 1000);
    result = (shiftedNumber - 1000 * q).toString() + ',' + ('000' + result).substr(-c);
    shiftedNumber = q;
    c += 4;
  }
  return result;
}

$(function(){
	$("#date-slider-container").css("display", "block").hide();
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

	$("#dialog-title-code").click(function(){
		advanceToDetailView()
	});

	$("#dialog-next-button").click(function(){
		advanceToDetailView()
	});

	// this event fires whenenver one of the checkboxes is filled
	$("input[type='checkbox']").change(function(){
		if(this.id!='chk_entity'){
			window.inclOfficers = $("#chk-officer").is(":checked");
			window.inclIntermediaries = $("#chk-intermediary").is(":checked");
			zoomed();
			drawDateSlider();
            drawGraph(window.selectedCountry, 'country_code');
			filterData();
		}
	});


	$("#dialog").hide();

	function setElementWidth(desc){
		var elwidth = $(window).width();
		$("#title-image").css("max-width", elwidth);
		var styles = {
			width: elwidth,
			height: .4752 * elwidth,
			padding: "50px",
			"background-color": "#dfe5ac",
			"background-color": "#cacfd2 ",
			"font-size":"16px"
		};
		$("#network-view").css(styles);
	}

	var width = Math.max(960, window.innerWidth),
		height = Math.max(500, 0.4752 * width),
		startColor = "#8856A7",
		endColor = "#FFCC00",
		linkColor = "#F9FFF3",
		dateSliderWidth = Math.round(width * 0.9),
		dateSliderHeight = 120,
		mapWidth = width,
		mapHeight = height,
		prefix = prefixMatch(["webkit", "ms", "Moz", "O"]);

	var tile = d3.geo.tile()
		.size([width, height]);

	var projection = d3.geo.mercator();

	var zoom = d3.behavior.zoom()
		.scale(1 << 11)
		.scaleExtent([1 << 9, 1 << 23])
		.translate([mapWidth / 2, mapHeight / 2 + mapHeight / 4])
		.on("zoom", zoomed);

	var map = d3.select("#data-map").append("div")
		.attr("class", "map")
		.style("width", mapWidth + "px")
		.style("height", mapHeight + "px")
		.call(zoom);

	// Basemap layer
	var layer = map.append("div")
		.attr("class", "layer");

	// Selected Date layer in map view
	var mapSelectedDateLayer = map.append("div")
		.attr("id", "selected-date")
		.style("left", ((width - 100) / 2) + "px");
    // Selected Date layer in detail view
    var detailSelectedDateLayer = d3.select("div#network-view-selected-date")
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
	var maxConnection = 0;
	var maxConnectionDate = new Date(0);
	window.selectedDate = window.selectedDate || new Date('2016-12-01');

	if (window.connectionCountArray.length == 0) {
		// Load the initial connection counts
		d3.csv('data/connection_count.csv', function(data) {
			data.forEach(function(v) {
				var monthStartDate = new Date(v.date);
				maxDate = (monthStartDate > maxDate) ? monthStartDate : maxDate;
				minDate = (monthStartDate < minDate) ? monthStartDate : minDate;
				var e = parseInt(v.includes_entity),
				    o = parseInt(v.includes_officer),
				    i = parseInt(v.includes_intermediary);
				var s = e + o + i;
				if (s > maxConnection) {
					maxConnection = s;
					maxConnectionDate = monthStartDate
				}
				window.connectionCountArray.push({
					monthDate: monthStartDate,
					includesEntity: e,
					includesOfficer: o,
					includesIntermediary: i,
					total: s
				});
			});
			window.selectedDate = maxConnectionDate;
			setUpDateSlider(minDate, maxDate);
		});

		// Load the country code-to-country name mapping
		d3.csv('data/country_geos.csv', function(data) {
			data.forEach(function(v) {
				window.countryLookupTable[v.alpha_3_code] = v.country;
			});
		});
	}



	console.log("spinner", "on");
	document.getElementById("loader").style.display = "block";

	// Data galore!
	function setUpDateSlider(minDate, maxDate) {
		// setup our brush as slider for date selection
		var sliderHeightOffset = dateSliderHeight / 2;
		window.sliderX = d3.time.scale()
		    .domain([minDate, maxDate])
		    .range([0, dateSliderWidth])
		    .clamp(true);

		window.dateBrush = d3.svg.brush()
		    .x(window.sliderX)
			.extent([window.sliderX.domain()[0],window.sliderX.domain()[0]])
		    .on("brush", brushed)
		    .on("brushend",brushended);


		sliderPanel.append("g")
		    .attr("class", "slider-x axis")
		    .attr("transform", "translate(0," + sliderHeightOffset + ")")
		    .call(d3.svg.axis()
					.scale(window.sliderX)
					.orient("bottom")
					//.ticks(d3.time.years)
					.ticks(d3.timeYear)
					.tickFormat(d3.time.format("%Y")))

			.select(".domain")
			.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
		    .attr("class", "halo");

        // Bar chart of the connection count on the date slider


		drawDateSlider();

		// Slider handlers
		function brushedValue(target, event) {
			var value;

			if (typeof window.dateBrush.extent() !== "undefined") {
				value = window.dateBrush.extent()[0];

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
			var target = this;
			var endEvent = d3.event.sourceEvent;
			var value = brushedValue(this, endEvent);

            updateBrushedDate(value);
			window.dateSliderHandle.attr("cx", window.sliderX(value));
		};

		function brushended() {
			var target = this;
			var endEvent = d3.event.sourceEvent;
			var value = brushedValue(target, endEvent);
      console.log("spinner", "on");
      document.getElementById("loader").style.display = "block";

			updateMap(value);
			drawGraph(window.selectedCountry, 'country_code');
		}
	}

	function drawDateSlider(){
		var sliderHeightOffset = dateSliderHeight / 2;
		var barColors = [ ['Officer', "#A1D99B"], ['Intermediary', "#FC9272"], ['Entity', "#A6BDDB"] ];
		sliderPanel.selectAll("rect.max-connection-bar")
		    .remove();
		sliderPanel.selectAll("rect.officer-bars")
			.remove();
		sliderPanel.selectAll("rect.intermediary-bars")
			.remove();
		sliderPanel.selectAll("g.date-slider")
		    .remove();

		// * Includes Officer
		if(window.inclOfficers){
			sliderPanel.selectAll("rect.officer-bars")
				.data(window.connectionCountArray)
				.enter()
				.append("rect")
				.style("fill", barColors[0][1])
				.attr("class", "officer-bars")
				.attr("height", function(d) { return d.includesOfficer / 10000.0;})
				.attr("width", 1.0 * dateSliderWidth / window.connectionCountArray.length)
				.attr("x", function(d) { return window.sliderX(d.monthDate); })
				.attr("y", function(d) {
					entitiesHeight = d.includesEntity / 10000.0;
					officersHeight = d.includesOfficer / 10000.0;
					intermediariesHeight = d.includesIntermediary / 10000.0;
					if( window.inclIntermediaries ){
						return sliderHeightOffset - ( entitiesHeight + officersHeight + intermediariesHeight );
					}else{
						return sliderHeightOffset - ( entitiesHeight + officersHeight );
					}
				});
		}

		// * Includes Intermediary
		if(window.inclIntermediaries){
			sliderPanel.selectAll("rect.intermediary-bars")
				.data(window.connectionCountArray)
				.enter()
				.append("rect")
				.style("fill", barColors[1][1])
				.attr("class", "intermediary-bars")
				.attr("height", function(d) { return d.includesIntermediary / 10000.0; })
				.attr("width", 1.0 * dateSliderWidth / window.connectionCountArray.length)
				.attr("x", function(d) { return window.sliderX(d.monthDate); })
				.attr("y", function(d) { return sliderHeightOffset - (d.includesEntity + d.includesIntermediary) / 10000.0;});
		}

		// * Includes Entity
		sliderPanel.selectAll("rect.entity-bars")
			.data(window.connectionCountArray)
			.enter()
			.append("rect")
			.style("fill", barColors[2][1])
			.attr("class", "entity-bars")
			.attr("height", function(d) { return d.includesEntity / 10000.0; })
			.attr("width", 1.0 * dateSliderWidth / window.connectionCountArray.length)
			.attr("x", function(d) { return window.sliderX(d.monthDate); })
			.attr("y", function(d) { return sliderHeightOffset - d.includesEntity / 10000.0; });

		// Date (month) having the most connections
		var maxConnectionBar = sliderPanel.selectAll("rect.max-connection-bar")
			.data([{ maxConnection: maxConnection, maxConnectionDate: maxConnectionDate }])
			.enter()
			.append("rect")
			.style("fill", "#ABABAB")
			.attr("class", "max-connection-bar")
			.attr("height", function(d) { return d.maxConnection / 10000.0; })
			.attr("width", 1.0 * dateSliderWidth / window.connectionCountArray.length)
			.attr("x", function(d) { return window.sliderX(d.maxConnectionDate); })
			.attr("y", function(d) { return sliderHeightOffset - d.maxConnection / 10000.0; });

		sliderPanel.append("text")
				   .attr("x", window.sliderX(maxConnectionDate))
				   .attr("y", sliderHeightOffset - 20 - maxConnection / 10000.0)
				   .attr("dy", "1em")
				   .style("font-size", "0.8em")
				   .text(maxConnection);

		window.slider = sliderPanel.append("g")
			.attr("class", "date-slider")
			.call(window.dateBrush);

		slider.selectAll(".extent,.resize")
			.remove();


		slider.select(".background")
			.attr("height", height);


		window.dateSliderHandle = slider.append("circle")
			.attr("class", "date-slider-handle")
			.attr("transform", "translate(0," + sliderHeightOffset + ")")
			.attr("r", 4)
			.style("stroke", "#707070")
			.style("stroke-width", 2)
			.style("fill", "#FFEDA0");

			window.dateSliderHandle
		    .attr("cx", window.sliderX(window.selectedDate));

	}

	function updateBrushedDate(value) {
        window.selectedDate = value;
        mapSelectedDateLayer
            .style("left", (width - 100) / 2)
            .html(d3.time.format("%b %Y")(window.selectedDate));
        detailSelectedDateLayer
            .html(d3.time.format("%b %Y")(window.selectedDate));
    }

	function updateMap( value ) {
        updateBrushedDate(value);
		var url = requestUrl(window.apiEndPoints["all"], window.selectedDate, null, null, null);
		fetchData(url, function( data ) {
			window.dataArray = data;
			zoomed();
		});
	}

	// Initial data fetch on load.
	var initialRequestUrl = requestUrl(window.apiEndPoints["all"], window.selectedDate, null, null, null);
	fetchData(initialRequestUrl, function( data ) {
		window.dataArray = data;

// 		document.getElementById("loader").style.display = "none";
// 		console.log("spinner", "off");
		zoomed();

		window.dateSliderHandle.attr("cx", window.sliderX(window.selectedDate));
		updateMap(window.selectedDate);
	});

	setElementWidth("ready");

	zoomed();

	console.log("spinner", "on");
	document.getElementById("loader").style.display = "block";

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


		filterData();
	}

	function filterData(){
		var startArray = [];
		var endArray = [];
		var edgeArray = [];
		var total =0;
		window.dataArray.forEach(function(v) {
		// Project data's lat/lon to map's coordinates
			ignore = ( ( v.node_type_1 =='officer' || v.node_type_2 =='officer' ) &&  !window.inclOfficers ) ||
					 ( ( v.node_type_1 =='intermediary' || v.node_type_2 =='intermediary' ) &&  !window.inclIntermediaries );
			total += 1;
			if( !ignore ){

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
					monthDate: monthDate,
					weight: v.weight/100
				});
			}
		});

		// get the connection_counts for the selected date
		var url = requestUrl (window.apiEndPoints['connections_by_date'], window.selectedDate, null, null, null);
		fetchData(url, function( data ) {
			// scale the counts
			totals =  data[0]
			officerConnections = parseInt( window.inclOfficers ? totals.includes_officer : 0);
			intermediaryConnections = parseInt( window.inclIntermediaries ? totals.includes_intermediary : 0 );
			totalConnections = parseInt( totals.includes_entity ) + officerConnections + intermediaryConnections;

			$("#officer-conn-count").text("(" +  addCommasToInteger(officerConnections) + ")");
			$("#intermediary-conn-count").text("(" + addCommasToInteger(intermediaryConnections) + ")");
			$("#entity-conn-count").text("(" + addCommasToInteger(totals.includes_entity) + ")");
			$("#connection-count-total").text("Total Connections: " + addCommasToInteger(totalConnections) );
		});

		// Draw data points and links
		drawData(startArray, endArray, edgeArray);
	}

	function drawData(startPoints, endPoints, connections) {
		svg.selectAll("circle.start-circle").remove();
		svg.selectAll("circle.end-circle").remove();
		svg.selectAll("path.edge").remove();

		svg.selectAll("path.edge")
			.data(connections)
			.enter()
			.append("path")
			.attr("class", "edge")
			.attr("d", function(d) {
				var sx = d.startX,
					sy = d.startY,
					tx = d.endX,
					ty = d.endY,
					dx = tx - sx * d.weight,
					dy = ty - sy * d.weight,
					dr = 2 * Math.sqrt(dx * dx + dy * dy);
				return "M" + sx + "," + sy + "A" + dr + "," + dr + " 0 0,1 " + tx + "," + ty;
			});

		svg.selectAll("circle.end-circle").data(endPoints).enter().append("circle")
			.attr("class", "end-circle")
			.attr("r", 5)
			.attr("title", "Country")
			.attr("countryCode", function (d){ return d.countryCode; })
			.attr("cx", function (d){ return d.x; })
			.attr("cy", function (d){ return d.y; })
			.attr("onclick", "circleClick(this, 'Country')")
			.style("fill", startColor)
			.style("stroke", "#B0B0B0")
			.style("stroke-width", 3)
			.append("svg:title")
			.text(function (d){ return d.countryName; });

		svg.selectAll("circle.start-circle").data(startPoints).enter().append("circle")
			.attr("class", "start-circle")
			.attr("r", 10)
			.attr("title", "Country")
			.attr("data-toggle", "modal")
			.attr("data-target", "#modalDI")
			.attr("countryCode", function (d){ return d.countryCode; })
			.attr("cx", function (d){ return d.x; })
			.attr("cy", function (d){ return d.y; })
			.attr("onclick", "circleClick(this, 'Country')")
			.style("fill", startColor)
			.style("stroke", "#B0B0B0")
			.style("stroke-width", 3)
			.append("svg:title")
			.text(function (d){ return d.countryName; });

		document.getElementById("loader").style.display = "none";
		console.log("spinner", "off");
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
