var mongoClientApp = angular.module('mongoClientApp', ['ngRoute']);

mongoClientApp.controller('QueryCtrl', ['$scope', function($scope) {

  $scope.runQuery = function() {
    $scope.yourQuery = '';
  }
}]);