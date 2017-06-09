angular.module('app').controller('queryCtrl', ['$scope', function($scope) {
  $scope.runQuery = function() {
    $scope.yourQuery = '';
  }

}]);