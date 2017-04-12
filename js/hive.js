/* What we expect:
    plotElementId: '#network-view'
    infoElementId: '#network-view-data'
    nodeTypes: ['Entity', 'Intermediary', 'Officer']
    nodes: [{ countryCode: 'PAN' },
            { countryCode: 'USA' }, ...]
    groupingName: 'countryCode'
*/

function drawHive(plotElementId, infoElementId, width, height, nodeTypes, nodes, links, groupingName) {
  // This is hard coded to having exactly 3 types in the "nodeTypes" array.
  // We could make this a little more flexible if time permits.
  var majorAngle = 2 * Math.PI / 3;
  var phi0 = -Math.PI / 2;
  var angle = d3.scale.ordinal()
      .domain(nodeTypes)
      .range([phi0, phi0 + majorAngle, phi0 + 2 * majorAngle]);

  var outerRadius = 0.7 * Math.min(height, width);
  var innerRadius = 0.1 * outerRadius;
  var radius = d3.scale.linear()
      .range([innerRadius, outerRadius]);

  var color = d3.scale.category20();

  var oldSvg = $(plotElementId + " svg");
  if (oldSvg.length > 0) {
	oldSvg = d3.select(plotElementId + " svg");
    d3.select(plotElementId + " svg").selectAll("*").remove();
  } else {
	oldSvg = d3.select(plotElementId).append("svg");
  }

  var svgHive = oldSvg
      .attr("width", width)
      .attr("height", height)
      .style("z-index", 5)
      .append("g")
      .attr("transform", "translate(" + outerRadius * 1.25 + "," + height * 0.42 + ")");


  // Nest nodes by type, for computing the rank.
  var nodesByType = d3.nest()
      .key(function(d) { return d.type; })
      .sortKeys(d3.ascending)
      .entries(nodes);

  // Compute the rank for each type, with padding between secondary grouping by groupingName.
  nodesByType.forEach(function(type) {
    var subgroupName = type.values[0][groupingName], count = 0;
    type.values.forEach(function(d, i) {
      if (d[groupingName] != subgroupName) subgroupName = d[groupingName], count += 2;
      d.index = count++;
    });
    type.count = count - 1;
  });

  // Set the radius domain.
  radius.domain(d3.extent(nodes, function(d) { return d.index; }));

  // Draw the axes.
  svgHive.selectAll(".hive-axis")
      .data(nodesByType)
      .enter()
      .append("line")
      .attr("class", "hive-axis")
      .attr("transform", function(d) { return "rotate(" + degrees(angle(d.key)) + ")"; })
      .attr("x1", radius(-2))
      .attr("x2", function(d) { return radius(d.count + 2); });

  // Draw the links.
  svgHive.append("g")
      .attr("class", "hive-links")
      .selectAll(".hive-link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "hive-link")
      .attr("d", link()
	      .angle(function(d) { return angle(d.type); })
	      .radius(function(d) { return radius(d.node.index); }))
      .on("mouseover", linkMouseover)
      .on("mouseout", mouseout);

  // Draw the nodes. Note that each node can have up to two connectors,
  // representing the source (outgoing) and target (incoming) links.
  svgHive.append("g")
      .attr("class", "hive-nodes")
      .selectAll(".hive-node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "hive-node")
      .style("fill", function(d) { return color(d[groupingName]); })
      .selectAll("circle")
      .data(function(d) { return d.connectors; })
      .enter()
      .append("circle")
      .attr("transform", function(d) { return "rotate(" + degrees(angle(d.type)) + ")"; })
      .attr("cx", function(d) { return radius(d.node.index); })
      .attr("r", 4)
      .on("mouseover", nodeMouseover)
      .on("mouseout", mouseout);


  // Initialize the info display.
  var info = d3.select(infoElementId)
      .text(defaultInfo = "Showing " + links.length + " connections among " + nodes.length + " nodes.");

  // Highlight the link and connected nodes on mouseover.
  function linkMouseover(d) {
    svgHive.selectAll(".hive-link").classed("active", function(p) { return p === d; });
    svgHive.selectAll(".hive-node circle").classed("active", function(p) { return p === d.source || p === d.target; });
    info.text("[" + (d.source.node.country_code == null ? "N/A" : d.source.node.country_code) + "] " +
              d.source.node.name + "(" + d.source.node.type +
              ") → [" +
              (d.target.node.country_code == null ? "N/A" : d.target.node.country_code) + "] " +
              d.target.node.name + "(" + d.target.node.type + ")");
  }

  // Highlight the node and connected links on mouseover.
  function nodeMouseover(d) {
    svgHive.selectAll(".hive-link").classed("active", function(p) { return p.source === d || p.target === d; });
    d3.select(this).classed("active", true);
    info.text("[" + (d.node.country_code == null ? "N/A" : d.node.country_code) + "] " + d.node.name + "(" + d.node.type + ")");
  }

  // Clear any highlighted nodes or links.
  function mouseout() {
    svgHive.selectAll(".active").classed("active", false);
    info.text(defaultInfo);
  }
}

// A shape generator for Hive links, based on a source and a target.
// The source and target are defined in polar coordinates (angle and radius).
// Ratio links can also be drawn by using a startRadius and endRadius.
// This class is modeled after d3.svg.chord.
function link() {
  var source = function(d) { return d.source; },
      target = function(d) { return d.target; },
      angle = function(d) { return d.angle; },
      startRadius = function(d) { return d.radius; },
      endRadius = startRadius,
      arcOffset = -Math.PI / 2;

  function link(d, i) {
    var s = node(source, this, d, i),
        t = node(target, this, d, i),
        x;
    if (t.a < s.a) x = t, t = s, s = x;
    if (t.a - s.a > Math.PI) s.a += 2 * Math.PI;
    var a1 = s.a + (t.a - s.a) / 3,
        a2 = t.a - (t.a - s.a) / 3;
    return s.r0 - s.r1 || t.r0 - t.r1
        ? "M" + Math.cos(s.a) * s.r0 + "," + Math.sin(s.a) * s.r0
        + "L" + Math.cos(s.a) * s.r1 + "," + Math.sin(s.a) * s.r1
        + "C" + Math.cos(a1) * s.r1 + "," + Math.sin(a1) * s.r1
        + " " + Math.cos(a2) * t.r1 + "," + Math.sin(a2) * t.r1
        + " " + Math.cos(t.a) * t.r1 + "," + Math.sin(t.a) * t.r1
        + "L" + Math.cos(t.a) * t.r0 + "," + Math.sin(t.a) * t.r0
        + "C" + Math.cos(a2) * t.r0 + "," + Math.sin(a2) * t.r0
        + " " + Math.cos(a1) * s.r0 + "," + Math.sin(a1) * s.r0
        + " " + Math.cos(s.a) * s.r0 + "," + Math.sin(s.a) * s.r0
        : "M" + Math.cos(s.a) * s.r0 + "," + Math.sin(s.a) * s.r0
        + "C" + Math.cos(a1) * s.r1 + "," + Math.sin(a1) * s.r1
        + " " + Math.cos(a2) * t.r1 + "," + Math.sin(a2) * t.r1
        + " " + Math.cos(t.a) * t.r1 + "," + Math.sin(t.a) * t.r1;
  }

  function node(method, thiz, d, i) {
    var node = method.call(thiz, d, i),
        a = +(typeof angle === "function" ? angle.call(thiz, node, i) : angle) + arcOffset,
        r0 = +(typeof startRadius === "function" ? startRadius.call(thiz, node, i) : startRadius),
        r1 = (startRadius === endRadius ? r0 : +(typeof endRadius === "function" ? endRadius.call(thiz, node, i) : endRadius));
    return {r0: r0, r1: r1, a: a};
  }

  link.source = function(_) {
    if (!arguments.length) return source;
    source = _;
    return link;
  };

  link.target = function(_) {
    if (!arguments.length) return target;
    target = _;
    return link;
  };

  link.angle = function(_) {
    if (!arguments.length) return angle;
    angle = _;
    return link;
  };

  link.radius = function(_) {
    if (!arguments.length) return startRadius;
    startRadius = endRadius = _;
    return link;
  };

  link.startRadius = function(_) {
    if (!arguments.length) return startRadius;
    startRadius = _;
    return link;
  };

  link.endRadius = function(_) {
    if (!arguments.length) return endRadius;
    endRadius = _;
    return link;
  };

  return link;
}

function degrees(radians) {
  return radians / Math.PI * 180 - 90;
}

