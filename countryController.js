var app = angular.module('app', [])
    .controller('countryController', ['$scope', 'Countries', function($scope, Countries){
        
        $scope.query = "";
        $scope.list = {};
        $scope.az = true;
        
        var country = new Countries();
        
        country.getAll(function(list, err){
            if(err) alert(err.name + err.msg);
            else $scope.list = list;
        });
        
        $scope.getCountry = function(){
            country.resolveQuery($scope.query, function(piece, err){
                if(err) alert(err);
                else $scope.list = country.sortByContinents(piece);
            });
        }
        
        $scope.checkBoxes = function(item){
            var counter = 0,
                item_len = item.countries.length;
            item.countries.map(function(piece, index){
                if(piece.checked) counter++;
            });
            if(item_len == counter) item.checked = true;
        }
        
        $scope.sort = function(){
            var i;
            if(!$scope.az){
                for(i in $scope.list){
                    $scope.list[i].countries.sort(function(a, b){
                        if(a.name > b.name) return 1;
                        else if(a.name < b.name) return -1;
                        else return 0;
                    });
                }
                $scope.az = true;
            } else{
                for(i in $scope.list){
                    $scope.list[i].countries.sort(function(a, b){
                        if(a.name > b.name) return -1;
                        else if(a.name < b.name) return 1;
                        else return 0;
                    });
                }
                $scope.az = false;
            }
        }
        
    }])
    .factory('Countries', ['$http', function($http){
        var Countries = function(){}
        
        Countries.prototype = (function(){
            var query_path = "https://restcountries.eu/rest/v1/",
                stored = {};
            return{
                getAll: function(callback){
                    var self = this;
                    
                    $http({
                        method: "GET",
                        url: query_path + "all"
                    }).then(function(res){
                        stored = self.sortByContinents(res.data);
                        callback(stored);
                    }, function(err){
                        var err = new Error();
                        err.name = "Connection Error";
                        err.message = "Server request was denied.";
                        callback(null, err);
                    });
                },
                sortByContinents: function(data){
                    var model = {};
                    data.map(function(piece, index){
                        if(!model[piece.region]) model[piece.region] = {name: "", countries: []};
                        model[piece.region].name = piece.region;
                        model[piece.region].countries.push(piece);
                    });
                    return model;
                },
                resolveQuery: function(query, callback){
                    $http({
                        method: "GET",
                        url: query_path + "name/" + query
                    }).then(function(res){
                        callback(res.data);
                    }, function(err){
                        var err = new Error();
                        err.name = "Connection Error";
                        err.message = "Server request was denied.";
                        callback(null, err);
                    });
                }
            }
        })();
        return Countries;
    }]);