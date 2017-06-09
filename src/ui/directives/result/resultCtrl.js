angular.module('app').controller('resultCtrl', ['$scope', function($scope) {
  $scope.runQuery = function() {
    $scope.yourQuery = '';
  }
}]);