const primaryColor = '#0024d9';
const secondaryColor = 'red';
const highlightColor = 'cyan';

function map() {
    // add svg
    let box = document.getElementById('map');
    let width = box.offsetWidth;
    const height = width * .6;
    const svg = d3.select("#map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Map and projection
    const path = d3.geoPath();
    const projection = d3.geoAlbersUsa()
        .scale(1100)
        .translate([width / 2, height / 2]);

    // Data 
    const data = new Map();

    // Load external data and boot
    Promise.all([
        d3.json("data/states.json"),
        d3.csv("data/stateData.csv", function(d) {
            data.set(d.state, +d.lifeSat);
        })]).then(function(loadData) {
            let topo = loadData[0];


            let mouseLeave = function() {
                d3.selectAll(".state").style("opacity", 1);
            }

            const colorScale = d3.scaleLinear()
                .domain([Math.min(...data.values()), Math.max(...data.values())])
                .range(['#007bff', '#0007c9']);
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

            new Waypoint({
                element: document.getElementById('top5LifeSatStep'),
                handler: function(direction) {
                    if (direction == 'down') {
                        d3.selectAll(".state").style("opacity", .3);
                        for (let i = 0; i < 5; i++) {
                            const row = lifeSat[i];
                            document.getElementById(row[0]).style.opacity = 1;
                        }
                    }
                    else {
                        mouseLeave();
                    }
                },
                offset: '50%'
            });
            new Waypoint({
                element: document.getElementById('bottom5LifeSatStep'),
                handler: function(direction) {
                    if (direction == 'down') {
                        d3.selectAll(".state").style("opacity", .3);
                        for (let i = lifeSat.length - 1; i >= lifeSat.length - 5; i--) {
                            const row = lifeSat[i];
                            document.getElementById(row[0]).style.opacity = 1;
                        }
                    }
                    else {
                        mouseLeave();
                    }
                },
                offset: '50%'
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
            d.happiness = +d.happiness;
        });

        // Scale the range of the data
        x.domain(d3.extent(data, function(d) { return d.Q2; }));
        y.domain([0, d3.max(data, function(d) { return d.happiness; })]);
        
        const tooltip = d3.select("#tooltip0");

        // Add the scatterplot
        svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("r", 3)
        .attr("cx", function(d) { return x(d.Q2); })
        .attr("cy", function(d) { return y(d.happiness); })
        .style('fill', primaryColor)
        .style('opacity', 0.9)
        .on("mouseover", function(event, d) {
            tooltip.html('The average happiness score for respondents aged <b>' + d.Q2 + " years</b> \n is <b>" + d.happiness.toFixed(1) + "</b>")
                .style('left', event.pageX + 5 + 'px')
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
            .call(d3.axisBottom(x).tickSizeOuter(0));

        // Add the Y Axis
        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).tickSizeOuter(0));

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
            .text('"How happy did you feel yesterday?"');
        svg.append("text")
            .attr("class", "y-axis-sublabel")
            .attr("x", 14)
            .attr("y", 20 + margin.top)
            .text('Scale of 0 (not at all) - 10 (completely)');

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
        y.domain([0, d3.max(data, function(d) { return d.happiness; })]);
        
        // Add the scatterplot
        svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("r", 3)
        .attr("cx", function(d) { return x(d.Q2); })
        .attr("cy", function(d) { return y(d.happiness); })
        .style('fill', 'rgb(25,50,140)')
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

function packedCountryCircles() {
    // set the dimensions and margins of the graph
    let box = document.getElementById('packedCountryCircles');
    let width = box.offsetWidth;
    const height = width * 1.25;

    // append the svg object to the body of the page
    const svg = d3.select("#packedCountryCircles")
    .append("svg")
        .attr("width", width)
        .attr("height", height);

    // names for the tooltip
    const theirAnswers = ["China","India","United States","Indonesia","Pakistan","Nigeria","Brazil","Bangladesh","Russia","Mexico","Japan","Ethiopia","Philippines","Egypt","Vietnam","DR Congo","Iran","Turkey","Germany","France","United Kingdom","Thailand","South Africa","Tanzania","Italy","Myanmar","South Korea","Colombia","Kenya","Spain","Argentina","Algeria","Sudan","Uganda","Iraq","Ukraine","Canada","Poland","Morocco","Uzbekistan","Saudi Arabia","Peru","Angola","Afghanistan","Malaysia","Mozambique","Ghana","Yemen","Ivory Coast","Nepal","Venezuela","Madagascar","Australia","North Korea","Cameroon","Niger","Taiwan","Sri Lanka","Burkina Faso","Malawi","Mali","Chile","Kazakhstan","Romania","Zambia","Syria","Ecuador","Netherlands","Senegal","Guatemala","Chad","Somalia","Cambodia","Zimbabwe","South Sudan","Rwanda","Guinea","Burundi","Benin","Bolivia","Tunisia","Haiti","Belgium","Jordan","Cuba","Dominican Republic","Czech Republic","Sweden","Greece","Portugal","Azerbaijan","Hungary","Israel","Honduras","Tajikistan","United Arab Emirates","Belarus","Papua New Guinea","Austria","Switzerland","Sierra Leone","Togo","Hong Kong (China)","Paraguay","Laos","Libya","El Salvador","Serbia","Lebanon","Kyrgyzstan","Nicaragua","Bulgaria","Turkmenistan","Denmark","Congo","Central African Republic","Finland","Singapore","Norway","Slovakia","Palestine","Costa Rica","New Zealand","Ireland","Kuwait","Liberia","Oman","Panama","Mauritania","Croatia","Georgia","Eritrea","Uruguay","Mongolia","Bosnia and Herzegovina","Puerto Rico (United States)","Armenia","Lithuania","Albania","Qatar","Jamaica","Moldova","Namibia","Gambia","Botswana","Gabon","Lesotho","Slovenia","Latvia","North Macedonia","Kosovo","Guinea-Bissau","Equatorial Guinea","Bahrain","Trinidad and Tobago","Estonia","East Timor","Mauritius","Eswatini","Djibouti","Cyprus","Fiji","Comoros","Bhutan","Guyana","Solomon Islands","Macau (China)","Luxembourg","Montenegro","Western Sahara","Suriname","Cape Verde","Malta","Belize","Brunei","Bahamas","Maldives","Northern Cyprus","Iceland","Transnistria","Vanuatu","Barbados","French Polynesia (France)","New Caledonia (France)","Abkhazia","São Tomé and Príncipe","Samoa","Saint Lucia","Guam (United States)","Curaçao (Netherlands)","Artsakh","Kiribati","Grenada","Aruba (Netherlands)","Saint Vincent and the Grenadines","Jersey (British Crown Dependency)","Micronesia","Tonga","Antigua and Barbuda","Seychelles","U.S. Virgin Islands (United States)","Isle of Man (British Crown Dependency)","Andorra","Dominica","Cayman Islands (United Kingdom)","Bermuda (United Kingdom)","Guernsey (British Crown Dependency)","Greenland (Denmark)","Marshall Islands","Saint Kitts and Nevis","Faroe Islands (Denmark)","South Ossetia","American Samoa (United States)","Northern Mariana Islands (United States)","Turks and Caicos Islands (United Kingdom)","Sint Maarten (Netherlands)","Liechtenstein","Monaco","Gibraltar (United Kingdom)","San Marino","Saint Martin (France)","Åland (Finland)","British Virgin Islands (United Kingdom)","Palau","Cook Islands","Anguilla (United Kingdom)","Nauru","Wallis and Futuna (France)","Tuvalu","Saint Barthélemy (France)","Saint Helena, Ascension and Tristan da Cunha (United Kingdom)","Saint Pierre and Miquelon (France)","Montserrat (United Kingdom)","Falkland Islands (United Kingdom)","Christmas Island (Australia)","Norfolk Island (Australia)","Niue","Tokelau (New Zealand)","Vatican City","Cocos (Keeling) Islands (Australia)","Pitcairn Islands (United Kingdom)"];
    const myAnswers = ['Prussia...?', "Is it 'England' or 'Britain'?", "I think we're at war with this one?", "The one I live in", "They taught us propaganda about this one in 2nd grade"];

    const data = [
        {
            'name': 'Family',
            'value': 45.06,
            'group': 1
        },
        {
            'name': 'Religion',
            'value': 4.54,
            'group': 2
        },
        {
            'name': 'Finances',
            'value': 6.18,
            'group': 3
        },
        {
            'name': 'Health',
            'value': 6.32,
            'group': 4
        },
    ];
    
    // A scale that gives a Y target position for each group
    const y = d3.scaleOrdinal()
        .domain([1, 2, 3, 4])
        .range([height * .1, height * .35, height * .6, height * .85])

    // A color scale
    const color = d3.scaleOrdinal()
        .domain([1, 2, 3, 4])
        .range([ "#26f0f1", "#e75a7c", "#5438dc", "#f0b67f"]);

    // A size scale
    const size = d3.scaleLinear()
        .domain([0, 100])
        .range([10, 100]);

    const tooltip = d3.select("#tooltip");

    // Initialize the circle: all located at the center of the svg area
    const node = svg.append("g")
        .selectAll("circle")
        .data(data)
        .join("circle")
            .attr("r", d => size(d.value))
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .style("fill", d => color(d.group))
            .attr('class', d => 'countryCircle' + d.group)
            .style('opacity', 1)
            .attr("stroke", "black")
            .style("stroke-width", 1)
            .on("mouseover", function(event, d) {
                tooltip.html(d.name + "<br>" + d.value.toFixed(1) + "%")
                .style('left', d.x + 'px')
                    .style('top', d.y + 'px')
                    .transition()
                    .duration(250)
                    .style('opacity', 1);
            })
            .on("mouseout", function() {
                tooltip.transition().duration(250).style('opacity', 0);
            });

    // Features of the forces applied to the nodes:
    var simulation = d3.forceSimulation()
        .force("x", d3.forceX().strength(0.05).x(width / 2 ))
        .force("y", d3.forceY().strength(0.05).y(height / 2 ))
        .force("charge", d3.forceManyBody().strength(1)) // Nodes are attracted one each other of value is > 0
        .force("collide", d3.forceCollide().strength(2).radius(50).iterations(20)) // Force that avoids circle overlapping

    // Apply these forces to the nodes and update their positions.
    // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
    simulation
        .nodes(data)
        .on("tick", function(d){
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
        });
}

function main() {
    map();
    ageAndHappiness();
    miniChart();
    packedCountryCircles();

    // new Waypoint({
    //     element: document.getElementById('countryStep1'),
    //     handler: function(direction) {
    //         const opacity = direction == 'down' ? .75 : 0;
    //         d3.selectAll('.countryCircle1').transition().duration(1000).style('opacity', opacity);
    //     },
    //     offset: '50%'
    // });
    // new Waypoint({
    //     element: document.getElementById('countryStep2'),
    //     handler: function(direction) {
    //         const opacity = direction == 'down' ? .75 : 0;
    //         d3.selectAll('.countryCircle2').transition().duration(1000).style('opacity', opacity);
    //     },
    //     offset: '50%'
    // });
    // new Waypoint({
    //     element: document.getElementById('countryStep3'),
    //     handler: function(direction) {
    //         const opacity = direction == 'down' ? .75 : 0;
    //         d3.selectAll('.countryCircle3').transition().duration(1000).style('opacity', opacity);
    //     },
    //     offset: '50%'
    // });
    // new Waypoint({
    //     element: document.getElementById('countryStep4'),
    //     handler: function(direction) {
    //         const opacity = direction == 'down' ? .75 : 0;
    //         d3.selectAll('.countryCircle4').transition().duration(1000).style('opacity', opacity);
    //     },
    //     offset: '50%'
    // });

    var rellax = new Rellax('.rellax');
}

main();