/**
 * Created by arid6405 on 12/8/13.
 */

var w = 960, //canvas width
    h = 700, //canvas height
    r = Math.min(w, h) / 4; //radius of the circle my arc will follow
    s = .09; //arc spacing


var arc = d3.svg.arc()
    .startAngle(0)
    .endAngle(function(d) { return d.value * Math.PI; })
    .innerRadius(function(d) { return 1.25 * r; })
    .outerRadius(function(d) { return 1.5 * r; });

var arc2 = d3.svg.arc()
    .startAngle(0)
    .endAngle(  Math.PI  )
    .innerRadius(function(d) { return r; })
    .outerRadius(function(d) { return 1.25 * r; });


var vis = d3.select("#chart").append("svg")
    .attr("width", w)
    .attr("height", h)
    .append("g")
    .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

var g;

g = vis.selectAll("g")
    .data([{value: 0.3},{value: 1}])
    .enter().append("g")
    .attr("class", "arc");


g.append("path")
    .style("fill", "#FF0000")
    .attr("d", arc)

g.append("path")
    .style("fill", "#DDDDDD")
    .attr("d", arc2)


window.addEventListener("keypress", selectArcs, false);

function selectArcs() {
    d3.selectAll("g.arc > path")
        .each(arcTween);
}

function arcTween(){
    d3.select(this)
        .transition().duration(1500)
        .attrTween("d", tweenArc({ value : Math.random() }));
}

function tweenArc(b) {
    return function(a) {
        var i = d3.interpolate(a, b);
        for (var key in b) a[key] = b[key]; // update data
        return function(t) {
            return arc(i(t));
        };
    };
}

