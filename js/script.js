const primaryColor = '#0024d9';
const secondaryColor = 'red';
const highlightColor = 'cyan';

function runStreaks() {

    let box = document.getElementById('runStreaksScatterplot');
    let width = box.offsetWidth;

    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 20, bottom: 20, left: 20};
    width = width - margin.left - margin.right;
    var height = width * .5 - margin.top - margin.bottom;

    // set the ranges
    var x = d3.scaleLinear().range([margin.left, width - margin.right]);
    var y = d3.scaleLinear().range([height, 0]);

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#runStreaksScatterplot").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    // Get the data
    d3.csv("data/runStreaks.csv").then(function(data) {

        // format the data
        data.forEach(function(d) {
            d.age = +d.age;
            d.days = +d.days;
        });

        // Scale the range of the data
        x.domain(d3.extent(data, function(d) { return d.days; }));
        y.domain([0, d3.max(data, function(d) { return d.age; })]);
        
        // Add the scatterplot
        svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("r", 5)
        .attr("cx", function(d) { return x(d.days); })
        .attr("cy", function(d) { return y(d.age); })
        .style('fill', function(d) { if (d.days > 10) return primaryColor; else return secondaryColor})
        .style('opacity', function(d) { if (d.days > 10) return 0.5; else return 1})
        .on('mouseover', function() {
            d3.select(this).style('stroke', highlightColor).style('stroke-width', 3).raise();
        })
        .on('mouseout', function() {
            d3.select(this).style('stroke', 'none');
        })

        // Handmade legend
        svg.append("circle").attr("cx", x(18000)).attr("cy", y(25)).attr("r", 6).style("fill", secondaryColor);
        svg.append("circle").attr("cx", x(18000)).attr("cy", y(20)).attr("r", 6).style("fill", primaryColor);
        svg.append("text").attr("x", x(18300)).attr("y", y(25)).text("Me").style("font-size", "15px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", x(18300)).attr("y", y(20)).text("Not me").style("font-size", "15px").attr("alignment-baseline","middle");

        // Add the X Axis
        svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

        // Add the Y Axis
        svg.append("g")
        .call(d3.axisLeft(y));

        svg.append("text")
            .attr("class", "x-axis-label")
            .attr("x", width)
            .attr("y", height - 5)
            .text("Days ran in a row");
        svg.append("text")
            .attr("class", "y-axis-label")
            .attr("x", 5)
            .attr("y", 0 + margin.top)
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

    const data = [];
    const numCountries = 195;

    for (let i = 0; i < 195 * .95; i++) {
        data.push({'name':theirAnswers[i], 'group':1});
    }
    for (let i = 0; i < 195 * .75; i++) {
        data.push({'name':theirAnswers[i], 'group':2});
    }
    for (let i = 0; i < 195 * .5; i++) {
        data.push({'name':theirAnswers[i], 'group':3});
    }
    for (let i = 0; i < 195 * .1; i++) {
        data.push({'name':myAnswers[i % myAnswers.length], 'group':4});
    }

    // A scale that gives a Y target position for each group
    const y = d3.scaleOrdinal()
        .domain([1, 2, 3, 4])
        .range([height * .1, height * .35, height * .6, height * .85])

    // A color scale
    const color = d3.scaleOrdinal()
        .domain([1, 2, 3, 4])
        .range([ "#26f0f1", "#e75a7c", "#5438dc", "#f0b67f"]);

    const tooltip = d3.select("#tooltip");

    // Initialize the circle: all located at the center of the svg area
    const node = svg.append("g")
        .selectAll("circle")
        .data(data)
        .join("circle")
            .attr("r", 5)
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .style("fill", d => color(d.group))
            .attr('class', d => 'countryCircle' + d.group)
            .style('opacity', 0)
            // .style("fill-opacity", .75)
            .attr("stroke", "black")
            .style("stroke-width", 1)
            .on("mouseover", function(event, d) {
                tooltip.html(d.name)
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
        .force("y", d3.forceY().strength(5).y(d => y(d.group)))
        .force("charge", d3.forceManyBody().strength(1)) // Nodes are attracted one each other of value is > 0
        .force("collide", d3.forceCollide().strength(.05).radius(5).iterations(1)) // Force that avoids circle overlapping

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

function xkcdChart() {
    const svg = document.getElementById('xkcdLineplot');

    new chartXkcd.Line(svg, {
        title: 'How to make enemies and irritate people',
        xLabel: 'Time',
        yLabel: 'Enemies',
        data: {
        labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        datasets: [{
            label: 'Enemies',
            data: [0, 1, 4, 9, 16, 25, 36, 49, 64, 81],
        }],
        },
        options: {
            yTickCount: 3,
            legendPosition: chartXkcd.config.positionType.upLeft,
            dataColors: [primaryColor],
            backgroundColor: 'none',
            strokeColor: 'rgb(50,50,100)',
            showLegend: false
        }
    });
}

function drawPie() {
    // create Donut chart using defined data & customize plot options
    new roughViz.Donut(
        {
            element: '#pieChart',
            data: {
                labels: ['Checking Gmail', 'On my phone', 'Snacking', 'Actual work'],
                values: [20, 49, 23, 8]
            },
            title: "How I Spend My Day [%]",
            width: window.innerWidth / 4,
            roughness: 2,
            colors: ['red', 'orange', 'blue', 'skyblue'],
            stroke: 'black',
            strokeWidth: 3,
            fillStyle: 'hachure',
            fillWeight: 3,
            legendPosition: 'left',
            titleFontSize: '1.5rem',
            margin: {top: 70, right: 0, bottom: 0, left: 0}
        }
    );
    new roughViz.Donut(
        {
            element: '#pieChart2',
            data: {
                labels: ['Checking Gmail', 'On their phone', 'Snacking', 'Actual work'],
                values: [14, 19, 2, 65]
            },
            title: "How Others Spend Their Day?",
            width: window.innerWidth / 4,
            roughness: 2,
            colors: ['red', 'orange', 'blue', 'skyblue'],
            stroke: 'black',
            strokeWidth: 3,
            fillStyle: 'hachure',
            fillWeight: 3,
            legendPosition: 'left',
            titleFontSize: '1.5rem',
            margin: {top: 70, right: 0, bottom: 0, left: 0}
        }
    );
    const legend = document.querySelector('.roughpieChart');
    legend.style.transform = 'translate(0px, 10px)';
    const legend2 = document.querySelector('.roughpieChart2');
    legend2.style.transform = 'translate(0px, 10px)';
}

function main() {
    runStreaks();
    packedCountryCircles();
    xkcdChart();
    drawPie();

    new Waypoint({
        element: document.getElementById('countryStep1'),
        handler: function(direction) {
            const opacity = direction == 'down' ? .75 : 0;
            d3.selectAll('.countryCircle1').transition().duration(1000).style('opacity', opacity);
        },
        offset: '50%'
    });
    new Waypoint({
        element: document.getElementById('countryStep2'),
        handler: function(direction) {
            const opacity = direction == 'down' ? .75 : 0;
            d3.selectAll('.countryCircle2').transition().duration(1000).style('opacity', opacity);
        },
        offset: '50%'
    });
    new Waypoint({
        element: document.getElementById('countryStep3'),
        handler: function(direction) {
            const opacity = direction == 'down' ? .75 : 0;
            d3.selectAll('.countryCircle3').transition().duration(1000).style('opacity', opacity);
        },
        offset: '50%'
    });
    new Waypoint({
        element: document.getElementById('countryStep4'),
        handler: function(direction) {
            const opacity = direction == 'down' ? .75 : 0;
            d3.selectAll('.countryCircle4').transition().duration(1000).style('opacity', opacity);
        },
        offset: '50%'
    });
}

main();