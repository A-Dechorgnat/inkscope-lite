/**
 * Created by Alain Dechorgnat on 1/13/14.
 */
// angular stuff
// create module
var CollectionApp = angular.module('CollectionApp', [])
    .filter('bytes', bytesFilter);

// create controller
CollectionApp.controller("CollectionCtrl", function ($rootScope, $http) {
    var apiURL = '/mongoose/';

    $rootScope.collections = ["cephprobe","cluster","cpus", "cpustat","crushmap","disks","diskstat","hosts","memstat","mon","monstat","net","netstat","nodes","osd","osdstat","partitions","partitionstat","pg","pools","rules","swapstat","sysprobe","system.indexes","types"];

    $rootScope.getCollection = function(collectionName){
        $http({method: "get", url: apiURL + "ceph/"+collectionName+"/_find"}).
            success(function (data, status) {
                $rootScope.status = status;
                $rootScope.keys = [];
                for ( property in data.results[0] ) {
                    $rootScope.keys.push(property);
                }
                $rootScope.datas = data.results;

            }).
            error(function (data, status) {
                $rootScope.status = status;
                $rootScope.datas = data || "Request failed";
            });
    }

    $rootScope.prettyPrint = function( object){
        return object.toString();
    }

    $rootScope.prettyPrintKey = function( key){
        return key.replace(new RegExp( "_", "g" )," ")
    }
});

