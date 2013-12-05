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
});


// D3 representation

//d3 directive
poolUsageApp.directive('myGauge', function () {

    return {
        restrict: 'E',
        terminal: true,
        scope: {
            value: '=',
            colormode:  '='
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

            scope.$watch('value', function (percentValue, oldPercentValue) {

                //misc
                function percent_to_angle(percent) {
                    return (-(Math.PI / 2.0) + (Math.PI * percent));
                }

                var colorFunc;
                //console.log(attrs.colormode);
                if (attrs.colormode=='asc'){colorFunc = color4ascPercent;}
                else {colorFunc = color4descPercent;}

                // clear the elements inside of the directive
                svg.selectAll('*').remove();
                // if 'percentUsed' is undefined, exit
                if (!percentValue) {
                    return;
                }

                //available
                var arc = d3.svg.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius)
                    .startAngle(percent_to_angle(0.0))
                    .endAngle(percent_to_angle(1.0))

                svg.append("path")
                    .attr("d", arc)
                    .attr("fill", "#dddddd");


                //used
                arc = d3.svg.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius)
                    .startAngle(percent_to_angle(0))
                    .endAngle(percent_to_angle(percentValue));

                var myarc = svg.append("path")
                    .attr("d", arc)
                    .attr("fill", colorFunc(percentValue))
                    .datum({endAngle: percent_to_angle(percentValue)})

                //pourcentage au centre
                svg.append("text")
                    .text((percentValue * 100).toFixed(1) + " %")
                    .attr("text-anchor", "middle")
                    .attr("font-size", "30px")
                    .attr("font-family", "arial")
            });
        }
    }

});
