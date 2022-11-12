const primaryColorLight = 'hsl(197, 97%, 66%)'; // low end of map, bars, and younger ages in age analysis
const primaryColorDark = '#0006b8'; // high end of map, bars, and older ages in age analysis
const primaryColorMedium = '#2A6ADA'; 
const mobile = window.innerWidth < 600;

function map() {
    // add svg
    let box = document.getElementById('map');
    const width = box.offsetWidth * .95;
    let height = width * .6;

    if (mobile) {
        height = window.innerHeight * .4;
    }

    const svg = d3.select("#map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Map and projection
    const path = d3.geoPath();
    // const projection = d3.geoAlbersUsa().fitSize([width,height])
        // .scale(scale)
        // .translate([width / 2, height / 2]);

    // Data 
    const data = new Map();

    // Load external data and boot
    Promise.all([
        d3.json("data/states.json"),
        d3.csv("data/stateData.csv", function(d) {
            data.set(d.state, +d.lifeSat);
        })]).then(function(loadData) {
            let topo = loadData[0];


            let resetMapColors = function() {
                d3.selectAll(".state").style("opacity", 1);
            }

            const colorScale = d3.scaleLinear()
                .domain([Math.min(...data.values()), Math.max(...data.values())])
                .range([primaryColorLight, primaryColorDark]);
            // confirm data is sorted by life sat
            var lifeSat = [...new Map([...data.entries()].sort((a, b) => b[1] - a[1]))];

            // color text state names
            for (let i = 0; i < 5; i++) {
                const row = lifeSat[i];
                document.getElementById('top' + i).style.color = colorScale(row[1]);
            }
            for (let i = 0, r = lifeSat.length - 1; i < 5, r >= lifeSat.length - 5; i++, r--) {
                const row = lifeSat[r];
                document.getElementById('bottom' + i).style.color = colorScale(row[1]);
            }

            const projection = d3.geoAlbersUsa().fitSize([width,height], topo); // new project helps for mobile

            // Draw the map
            svg.append("g")
                .selectAll("path")
                .data(topo.features)
                .enter()
                .append("path")
                // draw each state
                .attr("d", d3.geoPath()
                    .projection(projection)
                )
                .attr("fill", function (d) {
                    d.total = data.get(d.properties.NAME) || 0;
                    return colorScale(d.total);
                })
                .attr("id", function (d) {
                    return d.properties.NAME;
                })
                .style("stroke", "white")
                .attr("class", "state" );

            // svg.append("g")
            //     .selectAll(".state-label")
            //     .data(topo.features)
            //     .enter()
            //     .append("text")
            //     .attr("class", "state-label")
            //     .text(function(d) {
            //         console.log(d);
            //         if (d.properties.NAME == 'Oregon') {
            //             return 'OR';
            //         }
            //         return '';
            //     })
            //     .attr("x", function(d){
            //         return d3.geoPath().projection(projection).centroid(d)[0];
            //     })
            //     .attr("y", function(d){
            //         return  d3.geoPath().projection(projection).centroid(d)[1];
            //     })
            //     .attr("text-anchor","middle")
            //     .attr('fill', 'white');

            // add color legend for map
            // create a list of keys
            const legendSVG = d3.select("#mapLegend")
                .append("svg")
                .attr("width", width)
                .attr("height", 100);

            var legendLabels = ["Lowest average", "Highest average"];

            var legendColorScale = d3.scaleOrdinal()
                .domain(legendLabels)
                .range([primaryColorLight, primaryColorDark]);

            const offset = 20; // where the first dot appears
            // Add one dot in the legend for each name.
            legendSVG.selectAll("legendMarkers")
            .data(legendLabels)
            .enter()
            .append("circle")
                .attr("cx", 20)
                .attr("cy", function(d,i){ return offset + i*25}) // 25 is the distance between dots
                .attr("r", 5)
                .style("fill", function(d){ return legendColorScale(d)})

            // Add one dot in the legend for each name.
            legendSVG.selectAll("legendLabels")
            .data(legendLabels)
            .enter()
            .append("text")
                .attr("x", 40)
                .attr("y", function(d,i){ return offset + i*25}) 
                .style("fill", function(d){ return legendColorScale(d)})
                .text(function(d){ return d})
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
                .style('font-size', '14px');

            new Waypoint({
                element: document.getElementById('top5LifeSatStep'),
                handler: function(direction) {
                    if (direction == 'down') {
                        d3.selectAll(".state").style("opacity", .2);
                        for (let i = 0; i < 5; i++) {
                            const row = lifeSat[i];
                            document.getElementById(row[0]).style.opacity = 1;
                        }
                    }
                    else {
                        resetMapColors();
                    }
                },
                offset: '50%'
            });
            new Waypoint({
                element: document.getElementById('bottom5LifeSatStep'),
                handler: function(direction) {
                    if (direction == 'down') {
                        d3.selectAll(".state").style("opacity", .2);
                        for (let i = lifeSat.length - 1; i >= lifeSat.length - 5; i--) {
                            const row = lifeSat[i];
                            document.getElementById(row[0]).style.opacity = 1;
                        }
                    }
                    else {
                        d3.selectAll(".state").style("opacity", .2);
                        for (let i = 0; i < 5; i++) {
                            const row = lifeSat[i];
                            document.getElementById(row[0]).style.opacity = 1;
                        }
                    }
                },
                offset: '50%'
            });
            new Waypoint({
                element: document.getElementById('finalMapStep'),
                handler: function(direction) {
                    if (direction == 'down') {
                        resetMapColors();
                    }
                    else {
                        d3.selectAll(".state").style("opacity", .2);
                        for (let i = lifeSat.length - 1; i >= lifeSat.length - 5; i--) {
                            const row = lifeSat[i];
                            document.getElementById(row[0]).style.opacity = 1;
                        }
                    }
                },
                offset: '50%'
            });

        });
}

function barRanker() {
    const margin = {top: 20, right: 30, bottom: 50, left: 30}

    // add svg
    let box = document.getElementById('barChart');
    let width = box.offsetWidth - margin.left - margin.right;
    let height = window.innerHeight * 1.5 - margin.top - margin.bottom;
    let yTickLabels = 'state';

    // x-axis labels
    let metricDict = {'lifeSat':'How satisfied are you with your life?', 'happiness':'How happy did you feel yesterday?', 'worthwhile':'To what extent do you feel that the things you do in your life are worthwhile?', 'anxiety':'How anxious did you feel yesterday?'};

    // adjust for mobile
    if (mobile) {
        height = window.innerHeight * 1.5;
        margin.left = 20;
        margin.right = 20;
        width = box.offsetWidth - margin.left - margin.right;
        yTickLabels = 'stateShort'; // use 2-letter abbreviations
        metricDict = {'lifeSat':'Life satisfaction', 'happiness':'Happiness', 'worthwhile':"Agree one's activities are worthwhile", 'anxiety':'Anxiousness'};
    }
    const svg = d3.select("#barChart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const tooltip = d3.select("#tooltipBars");

    // Parse the Data
    d3.csv("data/stateData.csv").then( function(data) {

        data.forEach(function(d) {
            d.lifeSat = +d.lifeSat;
            d.lifeSatRank = +d.lifeSatRank;
            d.anxiety = +d.anxiety;
            d.anxietyRank = +d.anxietyRank;
            d.worthwhile = +d.worthwhile;
            d.worthwhileRank = +d.worthwhileRank;
            d.happiness = +d.happiness;
            d.happyRank = +d.happyRank;
        });

        const colorScale = d3.scaleLinear()
            .domain(d3.extent(data, function(d) { return d.lifeSat; }))
            .range([primaryColorLight, primaryColorDark]);

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, 10])
            .range([ 0, width]);
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickSizeOuter(0).ticks(5));

        // Y axis
        const y = d3.scaleBand()
            .range([ 0, height ])
            .domain(data.map(d => d.lifeSatRank).sort(function(a, b){return a-b}))
            .padding(.05);
        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).tickSizeOuter(0).tickSize(0).tickFormat((d, i) => d == 1 || d % 5 == 0 ? d : ''));

        // bars
        svg.selectAll(".barChartRectangles")
            .data(data)
            .join("rect")
            .attr('class', 'barChartRectangles')
            .attr("x", x(0) )
            .attr("y", d => y(d.lifeSatRank))
            .attr("width", d => x(d.lifeSat))
            .attr("height", y.bandwidth())
            .attr("fill", d => colorScale(d.lifeSat))
            .on('mouseover', function(event, d) {
                d3.select(this).style('fill', 'orange');
                tooltip.html('State: ' + d.state + '<br>Rank: ' + d.lifeSatRank + '<br> Avg life satisfaction: ' + d.lifeSat.toFixed(1))
                    .transition()
                    .duration(250)
                    .style('opacity', 1);
            }).on('mousemove', function(event) {
                tooltip
                    .style('left', event.pageX / window.innerWidth <= 0.5 ? event.pageX + 5 + 'px' : event.pageX - tooltip.node().getBoundingClientRect().width + 'px')
                    .style('top', event.pageY + 10 + 'px')
            }).on('mouseout', function(d) {
                d3.select(this).style('fill', colorScale(d.lifeSat));
                tooltip.transition().duration(250).style('opacity', 0);
            });

        // text
        svg.selectAll(".textOnBars")
            .data(data)
            .join("text")
            .attr("x", x(0) + 5 )
            .attr("y", d => y(d.lifeSatRank) + (y.bandwidth() / 2))
            .text(d => d.state)
            .attr('class', 'textOnBars');

        svg.append("text")
            .attr("class", "x-axis-label")
            .attr('id', 'rankerAxisLabel')
            .style('text-anchor', 'middle')
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .text(metricDict['lifeSat']);

        d3.selectAll(".rankerButtons").on("click", function() {
            // determine which toggle was selected
            const metric = this.dataset.metric;
            const rankMetric = this.dataset.ranker;
            const metricTitle = this.innerHTML;

            // update scales
            colorScale.domain(d3.extent(data, function(d) { return d[metric]; }));
            y.domain(data.map(d => d[rankMetric]).sort(function(a, b){return a-b}));

            // update rectangles
            svg.selectAll(".barChartRectangles")
                .on('mouseover', function(event, d) { // update tooltip info
                    d3.select(this).style('fill', 'orange');
                    tooltip.html('State: ' + d.state + '<br>Rank: ' + d[rankMetric] + '<br> Avg ' + metricTitle.toLowerCase() + ': ' + d[metric].toFixed(1))
                        .transition()
                        .duration(250)
                        .style('opacity', 1);
                })
                .transition().duration(1500)
                .attr("fill", d => colorScale(d[metric])) // recolor
                .attr("y", d => y(d[rankMetric])) // move up or down
                .attr("width", d => x(d[metric])); // resize

            // move text labels
            svg.selectAll(".textOnBars").transition().duration(1500).attr("y", d => y(d[rankMetric]) + (y.bandwidth() / 2));

            // update x-axis label
            svg.select("#rankerAxisLabel").text(metricDict[metric]);

            // update button style
            d3.selectAll(".rankerButtons").each(function (p, j) {
                this.classList.remove('buttonSelected');
            });
            this.classList.add('buttonSelected');
        });
    });
}

function ageAndHappiness() {
    let box = document.getElementById('ageAndHappinessScatterplot');
    let width = box.offsetWidth;

    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 20, left: 30};
    width = width - margin.left - margin.right;
    var height = width * .5 - margin.top - margin.bottom;
    // adjust for mobile
    if (mobile) {
        height = window.innerHeight * .5;
        margin.left = 25;
        margin.right = 10;
    }

    // set the ranges
    var x = d3.scaleLinear().range([margin.left / 2, width - margin.right]);
    var y = d3.scaleLinear().range([height, 0]);

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#ageAndHappinessScatterplot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Get the data
    d3.csv("data/age_and_happiness.csv").then(function(data) {

        // format the data
        data.forEach(function(d) {
            d.Q2 = +d.Q2;
            d.lifeSat = +d.lifeSat;
        });

        // Scale the range of the data
        x.domain(d3.extent(data, function(d) { return d.Q2; }));
        y.domain([0, d3.max(data, function(d) { return d.lifeSat; })]);
        
        const tooltip = d3.select("#tooltip0");

        // Add the scatterplot
        svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("r", 3)
        .attr("cx", function(d) { return x(d.Q2); })
        .attr("cy", function(d) { return y(d.lifeSat); })
        .style('fill', primaryColorMedium)
        .style('opacity', 0.9)
        .on("mouseover", function(event, d) {
            tooltip.html('The average life satisfaction score for respondents aged <b>' + d.Q2 + " years</b> \n is <b>" + d.lifeSat.toFixed(1) + "</b>")
                .style('left', event.pageX / window.innerWidth <= 0.5 ? event.pageX + 5 + 'px' : event.pageX - tooltip.node().getBoundingClientRect().width + 'px')
                .style('top', event.pageY + 10 + 'px')
                .transition()
                .duration(250)
                .style('opacity', 1);
        })
        .on("mouseout", function() {
            tooltip.transition().duration(250).style('opacity', 0);
        });

        // Add the X Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "axis")
            .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0));

        // Add the Y Axis
        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).ticks(3).tickSizeOuter(0));

        // axis labels
        svg.append("text")
            .attr("class", "x-axis-label")
            .attr("x", width - margin.right)
            .attr("y", height - 10)
            .text("Age");
        svg.append("text")
            .attr("class", "y-axis-label")
            .attr("x", 10)
            .attr("y", 0 + margin.top)
            .text(mobile ? 'Life satisfaction' : '"How satisfied are you with your life?"');
        svg.append("text")
            .attr("class", "y-axis-sublabel")
            .attr("x", 14)
            .attr("y", 20 + margin.top)
            .text(mobile ? 'Scale of 0 - 10' : 'Scale of 0 (not at all) - 10 (completely)');

    });
}

function miniChart() {

    let box = document.getElementById('miniChart');
    let width = box.offsetWidth;

    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 10, bottom: 20, left: 30};
    width = width - margin.left - margin.right;
    var height = width * .5 - margin.top - margin.bottom;

    // set the ranges
    var x = d3.scaleLinear().range([margin.left / 3, width - margin.right]);
    var y = d3.scaleLinear().range([height, 0]);

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#miniChart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Get the data
    d3.csv("data/age_and_happiness_mock.csv").then(function(data) {

        // format the data
        data.forEach(function(d) {
            d.Q2 = +d.Q2;
            d.happiness = +d.happiness;
        });

        // Scale the range of the data
        x.domain(d3.extent(data, function(d) { return d.Q2; }));
        y.domain([5, d3.max(data, function(d) { return d.happiness; })]);
        
        // Add the scatterplot
        svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("r", 3)
        .attr("cx", function(d) { return x(d.Q2); })
        .attr("cy", function(d) { return y(d.happiness); })
        .style('fill', 'rgb(200,20,0)')
        .style('opacity', 0.7);

        // Add the X Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "mockAxis")
            .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0));

        // Add the Y Axis
        svg.append("g")
            .attr("class", "mockAxis")
            .call(d3.axisLeft(y).ticks(3).tickSizeOuter(0));

        // axis labels
        svg.append("text")
            .attr("class", "x-axis-label")
            .style('fill', 'gray')
            .style('font-size', '14px')
            .attr("x", width - margin.right)
            .attr("y", height - 5)
            .text("Age");
    });
}

function lollipop() {
    const colorOlder = primaryColorDark;
    const colorYounger = primaryColorLight;
    const colorBothAgeGroups = primaryColorMedium;

    const margin = {top: 10, right: 30, bottom: 30, left: 65};
    let box = document.getElementById('lollipop');
    let width = box.offsetWidth - margin.left - margin.right;
    const height = (width * 1.25) - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#lollipop")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Parse the Data
    d3.csv("data/themes.csv").then( function(data) {

        // add X axis
        const x = d3.scaleLinear()
            .domain([0, 50])
            .range([ 0, width]);
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0).tickFormat(function(d, i) { if (i == 0) return `${d}%`; else return d}));

        // add Y axis
        const y = d3.scaleBand()
            .range([ 0, height ])
            .domain(data.map(function(d) { return d.theme; }))
            .padding(1);
        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).tickSizeOuter(0).tickSize(0))
            .selectAll("text")
                .style("text-anchor", "start")
                .style("transform", `translate(-${margin.left-2}px, 0`);

        // Lines
        svg.selectAll("myline")
            .data(data)
            .enter()
            .append("line")
            .attr("x1", x(0)) // start not showing line for animation later
            .attr("x2", x(0))
            .attr("y1", function(d) { return y(d.theme); })
            .attr("y2", function(d) { return y(d.theme); })
            .attr("stroke", "black")
            .attr('id', function(d) { return d.theme + "Line"; });

        // Circles - overall
        svg.selectAll("mycircle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d) { return x(0); })  // start not showing line for animation later
            .attr("cy", function(d) { return y(d.theme); })
            .attr("r", 0)  // start not showing line for animation later
            .style("fill", colorBothAgeGroups)
            .attr("stroke", "black")
            .attr('id', function(d) { return d.theme + "Circle"; });

        // Circles - young cohort
        svg.selectAll("mycircle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d) { return x(0); })  // start not showing line for animation later
            .attr("cy", function(d) { return y(d.theme); })
            .attr("r", 0)  // start not showing line for animation later
            .style("fill", colorYounger)
            .attr("stroke", "black")
            .attr('id', function(d) { return d.theme + "CircleYoung"; });

        new Waypoint({
            element: document.getElementById('family'),
            handler: function(direction) {
                const value = direction == 'down' ? 45.06 : 0;
                const size = direction == 'down' ? 8 : 0;
                d3.select("#FamilyLine").transition().duration(1000).attr('x1', x(0)).attr('x2', x(value));
                d3.select("#FamilyCircle").transition().duration(1000).attr('cx', x(value)).attr('r', size).style("fill", colorBothAgeGroups);
            },
            offset: '50%'
        });
        new Waypoint({
            element: document.getElementById('religion'),
            handler: function(direction) {
                if (direction == 'down') {
                    d3.select("#HealthLine").transition().duration(1000).attr('x1', x(6.32));
                    d3.select("#HealthCircle").transition().duration(1000).attr('cx', x(6.32)).attr('r', 8).style("fill", colorBothAgeGroups);

                    d3.select("#FinancesLine").transition().duration(1000).delay(250).attr('x1', x(6.18));
                    d3.select("#FinancesCircle").transition().duration(1000).delay(250).attr('cx', x(6.18)).attr('r', 8).style("fill", colorBothAgeGroups);

                    d3.select("#ReligionLine").transition().duration(1000).delay(500).attr('x1', x(4.54));
                    d3.select("#ReligionCircle").transition().duration(1000).delay(500).attr('cx', x(4.54)).attr('r', 8).style("fill", colorBothAgeGroups);
                }
                else {
                    d3.select("#HealthLine").transition().duration(1000).delay(500).attr('x1', x(0)).attr('x2', x(0));
                    d3.select("#HealthCircle").transition().duration(1000).delay(500).attr('cx', x(0)).attr('r', 0);

                    d3.select("#FinancesLine").transition().duration(1000).delay(250).attr('x1', x(0)).attr('x2', x(0));
                    d3.select("#FinancesCircle").transition().duration(1000).delay(250).attr('cx', x(0)).attr('r', 0);

                    d3.select("#ReligionLine").transition().duration(1000).delay(0).attr('x1', x(0)).attr('x2', x(0));
                    d3.select("#ReligionCircle").transition().duration(1000).delay(0).attr('cx', x(0)).attr('r', 0);
                }
            },
            offset: '50%'
        });
        new Waypoint({
            element: document.getElementById('ageGaps'),
            handler: function(direction) {
                if (direction == 'down') {

                    d3.select("#hiddenTitle").transition().duration(1000).style('opacity', 1);

                    const familyOlder = 48.44;
                    const familyYounger = 41.0;
                    d3.select("#FamilyLine").transition().duration(1000).attr('x1', x(familyYounger)).attr('x2', x(familyOlder));
                    d3.select("#FamilyCircle").transition().duration(1000).attr('cx', x(familyOlder)).attr('r', 8).style("fill", colorOlder); //  now representing the 45+ age group
                    d3.select("#FamilyCircleYoung").transition().duration(1000).attr('cx', x(familyYounger)).attr('r', 8); // show new circle
                    
                    const healthOlder = 7.73;
                    const healthYounger = 4.62;
                    d3.select("#HealthLine").transition().duration(1000).attr('x1', x(healthYounger)).attr('x2', x(healthOlder));
                    d3.select("#HealthCircle").transition().duration(1000).attr('cx', x(healthOlder)).attr('r', 8).style("fill", colorOlder); //  now representing the 45+ age group
                    d3.select("#HealthCircleYoung").transition().duration(1000).attr('cx', x(healthYounger)).attr('r', 8); // show new circle

                    const financesOlder = 4.62;
                    const financesYounger = 8.05;
                    d3.select("#FinancesLine").transition().duration(1000).attr('x1', x(financesYounger)).attr('x2', x(financesOlder));
                    d3.select("#FinancesCircle").transition().duration(1000).attr('cx', x(financesOlder)).attr('r', 8).style("fill", colorOlder); //  now representing the 45+ age group
                    d3.select("#FinancesCircleYoung").transition().duration(1000).attr('cx', x(financesYounger)).attr('r', 8); // show new circle

                    const religionOlder = 6.34;
                    const religionYounger = 2.38;
                    d3.select("#ReligionLine").transition().duration(1000).attr('x1', x(religionYounger)).attr('x2', x(religionOlder));
                    d3.select("#ReligionCircle").transition().duration(1000).attr('cx', x(religionOlder)).attr('r', 8).style("fill", colorOlder); //  now representing the 45+ age group
                    d3.select("#ReligionCircleYoung").transition().duration(1000).attr('cx', x(religionYounger)).attr('r', 8); // show new circle
                }
                else {
                    d3.select("#hiddenTitle").transition().duration(1000).style('opacity', 0);

                    const familyOverall = 45.06;
                    d3.select("#FamilyLine").transition().duration(1000).attr('x1', x(0)).attr('x2', x(familyOverall));
                    d3.select("#FamilyCircle").transition().duration(1000).attr('cx', x(familyOverall)).style("fill", colorBothAgeGroups); //  now representing the all ages again
                    d3.select("#FamilyCircleYoung").transition().duration(1000).attr('cx', x(0)).attr('r', 0); // show new circle

                    const healthOverall = 6.32;
                    d3.select("#HealthLine").transition().duration(1000).attr('x1', x(0)).attr('x2', x(healthOverall));
                    d3.select("#HealthCircle").transition().duration(1000).attr('cx', x(healthOverall)).style("fill", colorBothAgeGroups);
                    d3.select("#HealthCircleYoung").transition().duration(1000).attr('cx', x(0)).attr('r', 0);

                    const financesOverall = 6.18;
                    d3.select("#FinancesLine").transition().duration(1000).attr('x1', x(0)).attr('x2', x(financesOverall));
                    d3.select("#FinancesCircle").transition().duration(1000).attr('cx', x(financesOverall)).style("fill", colorBothAgeGroups);
                    d3.select("#FinancesCircleYoung").transition().duration(1000).attr('cx', x(0)).attr('r', 0);

                    const religionOverall = 4.54;
                    d3.select("#ReligionLine").transition().duration(1000).attr('x1', x(0)).attr('x2', x(religionOverall));
                    d3.select("#ReligionCircle").transition().duration(1000).attr('cx', x(religionOverall)).style("fill", colorBothAgeGroups);
                    d3.select("#ReligionCircleYoung").transition().duration(1000).attr('cx', x(0)).attr('r', 0);
                }
            },
            offset: '50%'
        });
    });
}

function donations() {
    d3.csv("data/contributions.csv").then( function(data) {
        const activists = data.filter(d => d.title == 'Happiness Activist').slice().sort((a, b) => d3.ascending(a.name, b.name));
        activists.forEach(d => {
            var container = document.getElementById("activists");
            const div = document.createElement('div');
            div.innerHTML = d.name;
            div.classList.add('name');
            container.appendChild(div);
        })

        const others = data.filter(d => d.title == 'Other').slice().sort((a, b) => d3.ascending(a.name, b.name));
        others.forEach(d => {
            var container = document.getElementById("others");
            const div = document.createElement('div');
            div.innerHTML = d.name;
            div.classList.add('name');
            container.appendChild(div);
        })
    });
}

function addFootnoteInteraction(footnoteNum) {
    var footnote = document.getElementById("footnote" + footnoteNum);
    footnote.onclick = function() {
        currentStyle = document.getElementById("footnote" + footnoteNum + "Text").style.display;
        document.getElementById("footnote" + footnoteNum + "Text").style.display = (currentStyle === 'block') ? 'none' : 'block';
        footnote.innerHTML = (footnote.innerHTML === 'x') ? footnoteNum : 'x';
    };
    document.getElementById("footnote" + footnoteNum + "Text").onclick = function() {
        this.style.display = 'none';
        document.getElementById("footnote" + footnoteNum).innerHTML = footnoteNum;
    };
}

function main() {
    donations();
    map();
    barRanker();
    ageAndHappiness();
    if (!mobile) {
        miniChart();
    }
    lollipop();

    addFootnoteInteraction('1');
    addFootnoteInteraction('2');
    addFootnoteInteraction('3');

    var rellax = new Rellax('.rellax');
}

main();