// Initial Chart
var chartSelection = document.getElementById('select-chart').value;
var file = chartSelection.split(",")[0];
var description = chartSelection.split(",")[1];
var w = document.querySelector('.chart-container').clientWidth;
var h = document.querySelector('.chart-container').clientHeight;
executeChart(file, description, h, w);

// Reset Chart
d3.select("#clear-all")
  .on("click", function() {
    d3.select("#line-charts").selectAll("div > *").remove();
    executeChart(file, description, h, w);
  });

// Select the data and go into it
d3.select("#select-chart")
  .on("change", function() {
    d3.select("#line-charts").selectAll("div > *").remove();
    chartSelection = this.value;
    file = chartSelection.split(",")[0];
    description = chartSelection.split(",")[1];
    executeChart(file, description, h, w);
  });

function executeChart(insert, title, h, w) {
  var margin = {top: h/35*1.1, right: w/3.5*1.75, bottom: h/7, left: w/28},
      margin2 = { top: h/1.6279, right: w/140, bottom: h/35, left: w/35 },
      width = w - margin.left - margin.right,
      height = h - margin.top - margin.bottom,
      height2 = h/1.4 - margin2.top - margin2.bottom;

  var parseDate = d3.time.format("%Y%m%d").parse;
  var bisectDate = d3.bisector((d) => {return d.date;}).left;

  var xScale = d3.time.scale()
      .range([0, width + 110]),

      xScale2 = d3.time.scale()
      .range([0, width + 110]);

  var yScale = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom"),

      xAxis2 = d3.svg.axis()
      .scale(xScale2)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left");

  var line = d3.svg.line()
      .interpolate("basis")
      .x((d) => { return xScale(d.date); })
      .y((d) => { return yScale(d.rating); })
      .defined((d) => { return d.rating; });  // Hiding line value defaults of 0 for missing data

  var maxY;

  var svg = d3.select("#line-charts").append("svg")
      .attr("width", width + margin.left + margin.right + 100)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Create invisible rect for mouse tracking
  svg.append("rect")
      .attr("width", width + 110)
      .attr("height", height)
      .attr("x", 0)
      .attr("y", 0)
      .attr("id", "mouse-tracker")
      .style("fill", "white");

  // slider
  var context = svg.append("g") // Brushing context box container
      .attr("transform", "translate(" + 0 + "," + height*1.03 + ")")
      .attr("class", "context");

  svg.append("defs")
    .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width + 110)
      .attr("height", height);

  d3.csv(insert, (error, data) => {
    // colors for  list items
    var size = Object.keys(data[0]).length;
    var rainbow = new Array(size);

    for (var i=0; i<size; i++) {
      var red   = sin_to_hex(i, 0 * Math.PI * 2/3); // 0   deg
      var blue  = sin_to_hex(i, 1 * Math.PI * 2/3); // 120 deg
      var green = sin_to_hex(i, 2 * Math.PI * 2/3); // 240 deg

      rainbow[i] = "#"+ red + green + blue;
    };

    function sin_to_hex(i, phase) {
      var sin = Math.sin(Math.PI / size * 2 * i + phase);
      var int = Math.floor(sin * 127) + 128;
      var hex = int.toString(16);

      return hex.length === 1 ? "0"+hex : hex;
    };
    var color = d3.scale.ordinal().range(rainbow);
    // end coloring

    color.domain(d3.keys(data[0]).filter((key) => { // Set the domain of the color ordinal scale to be all the csv headers except "date", matching a color to an issue
      return key !== "date";
    }));

    data.forEach((d) => { // Make every date in the csv data a javascript date object format
      d.date = parseDate(d.date);
    });

    var categories = color.domain().map((name) => { // Nest the data into an array of objects with new keys

      return {
        name: name, // "name": the csv headers except date
        values: data.map((d) => { // "values": which has an array of the dates and ratings
          return {
            date: d.date,
            rating: +(d[name]),
            };
        })
      };
    });

    var half_length = Math.ceil(categories.length/2);
    var categories1 = categories.slice(0, half_length);
    var categories2 = categories.slice(half_length, categories.length);

    xScale.domain(d3.extent(data,(d) => { return d.date; })); // extent = highest and lowest points, domain is data, range is bouding box

    yScale.domain([0, 100]); //d3.max(categories, function(c) { return d3.max(c.values, function(v) { return v.rating; }); })

    xScale2.domain(xScale.domain()); // Setting a duplicate xdomain for brushing reference later

   // slider functionality and graphics
   var brush = d3.svg.brush()
      .x(xScale2)
      .on("brush", brushed);

    context.append("g")
        .attr("class", "x axis1")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    var contextArea = d3.svg.area()
      .interpolate("monotone")
      .x((d) => {return xScale2(d.date);})
      .y0(height2)
      .y1(0);

    // plot the rect as the bar at the bottom
    context.append("path")
      .attr("class", "area")
      .attr("d", contextArea(categories[0].values))
      .attr("fill", "#f1f1f2");

    //append the brush for the selection of subsection
    context.append("g")
      .attr("class", "x brush")
      .call(brush)
      .selectAll("rect")
      .attr("height", height2)
      .style("visibility", "visible")
      .attr("fill", "#d3d3d3");

    // end slider

    // draw line graph
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("x", -10)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(title);


    var issue1 = svg.selectAll(".issue1")
        .data(categories1)
      .enter().append("g")
        .attr("class", "issue1");

    var issue2 = svg.selectAll(".issue2")
        .data(categories2)
      .enter().append("g")
        .attr("class", "issue2");

    issue1.append("path")
        .attr("class", "line")
        .style("pointer-events", "none") // Stop line interferring with cursor
        .attr("id", (d) => {
          return "line-" + d.name.replace(" ", "").replace("/", ""); // Give line id of line-(insert issue name, with any spaces replaced with no spaces)
        })
        .attr("d", (d) => {
          return d.visible ? line(d.values) : null; // If array key "visible" = true then draw line, if not then don't
        })
        .attr("clip-path", "url(#clip)")//use clip path to make irrelevant part invisible
        .style("stroke", (d) => {
          return color(d.name);
        });

    issue2.append("path")
        .attr("class", "line")
        .style("pointer-events", "none") // Stop line interferring with cursor
        .attr("id", (d) => {
          return "line-" + d.name.replace(" ", "").replace("/", ""); // Give line id of line-(insert issue name, with any spaces replaced with no spaces)
        })
        .attr("d", (d) => {
          return d.visible ? line(d.values) : null; // If array key "visible" = true then draw line, if not then don't
        })
        .attr("clip-path", "url(#clip)")//use clip path to make irrelevant part invisible
        .style("stroke", (d) => {
          return color(d.name);
        });

    // draw legend
    var legendSpace = height * 2.1 / categories.length;

    // first legend column
    issue1.append("rect")
        .attr("width", 50)
        .attr("height", 10)
        .attr("x", width + (margin.right/10) + 85)
        .attr("y", (d, i) => {
          return (legendSpace)+(i-.3)*(legendSpace) - 8;
        })
        .attr("fill", (d) => {
          return d.visible ? color(d.name) : "#d3d3d3";
        })
        .attr("class", "legend-box")

        .on("click", (d) => {
            d.visible = !d.visible; // If array key for this data selection is "visible" = true then make it false, if false then make it true

            maxY = findMaxY(error, categories); // Find max Y rating value categories data with "visible"; true
            yScale.domain([0,maxY]); // Redefine yAxis domain based on highest y value of categories data with "visible"; true
            svg.select(".y.axis")
              .transition()
              .call(yAxis);

            issue1.selectAll("path")
              .transition()
              .attr("d", (d) => {
                return d.visible ? line(d.values) : null;
              })

            issue1.selectAll("rect")
              .transition()
              .attr("fill", (d) => {
                return d.visible ? color(d.name) : "#d3d3d3";
              });
        })

        issue1.append("text")
        .attr("x", width + (margin.right/10) + 100)
        .attr("y", (d, i) => {
          return (legendSpace)+(i-.3)*(legendSpace);
        })
        .text((d) => {
          return d.name;
        });

    // second legend column
    issue2.append("rect")
        .attr("width", 50)
        .attr("height", 10)
        .attr("x", width + (margin.right/1.75) + 10)
        .attr("y", (d, i) => {
          return (legendSpace)+(i-.3)*(legendSpace) - 8;
        })
        .attr("fill", (d) => {
          return d.visible ? color(d.name) : "#d3d3d3";
        })
        .attr("class", "legend-box")

        .on("click", (d) => {
            d.visible = !d.visible; // If array key for this data selection is "visible" = true then make it false, if false then make it true

            maxY = findMaxY(error, categories); // Find max Y rating value categories data with "visible"; true
            yScale.domain([0,maxY]); // Redefine yAxis domain based on highest y value of categories data with "visible"; true
            svg.select(".y.axis")
              .transition()
              .call(yAxis);

            issue2.selectAll("path")
              .transition()
              .attr("d", (d) => {
                return d.visible ? line(d.values) : null;
              })

            issue2.selectAll("rect")
              .transition()
              .attr("fill", (d) => {
                return d.visible ? color(d.name) : "#d3d3d3";
              });
        })

        issue2.append("text")
        .attr("x", width + (margin.right/1.75) + 25)
        .attr("y", (d, i) => {
          return (legendSpace)+(i-.3)*(legendSpace);
        })
        .text((d) => {
          return d.name;
        });

    //for brusher of the slider bar at the bottom
    function brushed() {

      xScale.domain(brush.empty() ? xScale2.domain() : brush.extent()); // If brush is empty then reset the Xscale domain to default, if not then make it the brush extent

      svg.select(".x.axis") // replot xAxis with transition when brush used
            .transition()
            .call(xAxis);

      maxY = findMaxY(error, categories); // Find max Y rating value categories data with "visible"; true
      yScale.domain([0,maxY]); // Redefine yAxis domain based on highest y value of categories data with "visible"; true

      svg.select(".y.axis") // Redraw yAxis
        .transition()
        .call(yAxis);

      issue1.select("path") // Redraw lines based on brush xAxis scale and domain
        .transition()
        .attr("d", (d) => {
            return d.visible ? line(d.values) : null; // If d.visible is true then draw line for this d selection
        });

      issue2.select("path") // Redraw lines based on brush xAxis scale and domain
        .transition()
        .attr("d", (d) => {
            return d.visible ? line(d.values) : null; // If d.visible is true then draw line for this d selection
        });

    };
  });
};

function findMaxY(error, data){
  var maxYValues = data.map((d) => {
    if (d.visible){
      return d3.max(d.values, (value) => {
        return value.rating; })
    }
  });
  return d3.max(maxYValues);
};
