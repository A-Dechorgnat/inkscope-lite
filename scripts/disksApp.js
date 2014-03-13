/**
 * Created by Alain Dechorgnat on 1/13/14.
 */
// angular stuff
// create module for custom directives
var DisksApp = angular.module('DisksApp', ['D3Directives'])
    .filter('bytes', function () {
        return function (bytes, precision) {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
            if (typeof precision === 'undefined') precision = 1;
            var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                number = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
        }
    });

DisksApp.controller("DisksCtrl", function ($rootScope, $http) {
    var apiURL = '/mongoose/';
    getDisks();

    function getDisks(){
        $http({method: "get", url: apiURL + "ceph/disks/_find"}).
            success(function (data, status) {
                $rootScope.status = status;
                $rootScope.keys = [];
                for ( property in data.results[0] ) {
                    $rootScope.keys.push(property);
                }
                $rootScope.disks = data.results;

            }).
            error(function (data, status) {
                $rootScope.status = status;
                $rootScope.disks = data || "Request failed";
            });
    }
});