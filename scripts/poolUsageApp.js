// angular stuff
// create module for custom directives
var poolUsageApp = angular.module('PoolUsage', [])
    .filter('bytes', function () {
        return function (bytes, precision) {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
            if (typeof precision === 'undefined') precision = 1;
            var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                number = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
        }
    });

poolUsageApp.controller("PoolUsageCtrl", function ($rootScope, $http, $templateCache) {
    var apiURL = '/ceph-rest-api/';
    setTimeout(function () {
        $http({method: "get", url: apiURL + "df.json", cache: $templateCache}).
            success(function (data, status) {
                $rootScope.status = status;
                $rootScope.data = data;
                $rootScope.pools = data.output.pools;
                $rootScope.stats = data.output.stats;
                var totalUsed = data.output.stats.total_used;
                var totalSpace = data.output.stats.total_space;
                $rootScope.percentUsed = totalUsed / totalSpace;
            }).
            error(function (data, status) {
                $rootScope.status = status;
                $rootScope.pools = data || "Request failed";
                $rootScope.stats.total_used = "N/A";
                $rootScope.stats.total_space = "N/A";
            });
    }, 4000);
});


// D3 representation

//d3 directive
poolUsageApp.directive('myGauge', function () {

    return {
        restrict: 'E',
        terminal: true,
        scope: {
            value: '=',
            colormode: '='
        },
        link: function (scope, element, attrs) {
            //console.log("my gauge enter");
            var width = 300,
                height = 150,
                radius = width / 2;
            innerRadius = radius - 60;
            outerRadius = radius - 10;

            var svg = d3.select(element[0])
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height + ")");


            //misc
            function percent_to_angle(percent) {
                return (-(Math.PI / 2.0) + (Math.PI * percent));
            }

            var colorFunc;
            //console.log(attrs.colormode);
            if (attrs.colormode == 'asc') {
                colorFunc = color4ascPercent;
            }
            else {
                colorFunc = color4descPercent;
            }

            function arcTween(b) {
                var i = d3.interpolate({value: b.previous}, b);
                return function(t) {
                    return arc(i(t));
                };
            }

            // clear the elements inside of the directive
            svg.selectAll('*').remove();

            var fields = [
                {value: 1, color: "#cccccc", name: "fond"},
                {value: 0, color: "#00FF00", name: "na"}
            ];

            fields[0].previous = fields[0].value = 1;

            var arc = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius)
                .startAngle(-Math.PI / 2)
                .endAngle(function (d) {
                    return d.value * Math.PI - Math.PI / 2;
                });


            scope.$watch('value', function (percentValue, oldPercentValue) {

                // if 'percentUsed' is undefined, exit
                if (!percentValue) {
                    return;
                }

                fields[1].previous = fields[1].value;
                fields[1].value = percentValue;

                var path = svg.selectAll("path")
                    .data(fields)
                    .attr("fill", function (d) {
                        if (d.name == "fond")return d.color; else return colorFunc(d.value);
                    });
                path.enter().append("svg:path");
                path.transition()
                    .ease("linear")
                    .duration(1500)
                    .attrTween("d", arcTween)
                    .style("fill", function (d) {
                        if (d.name == "fond")return d.color; else return colorFunc(d.value);
                    });

                svg.selectAll("text").remove();
                var gaugeText = svg.selectAll("text")
                    .data([fields[1]])
                    .enter()
                    .append("text")
                    .text(function(d){return (d.value*100).toFixed(1) + " %";})
                    .attr("text-anchor", "middle")
                    .attr("font-size", "30px")
                    .attr("font-family", "arial")
                    .transition()
                    .duration(1500)
                    .tween("text", function(d) {
                        var i = d3.interpolate(d.previous, d.value);
                        return function(t) {
                            this.textContent = (i(t)*100).toFixed(1) + " %";
                        };
                    });

            });


        }
    }

});
