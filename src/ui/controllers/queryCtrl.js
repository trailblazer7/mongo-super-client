angular.module('app').controller('queryCtrl', [
  '$scope',
  'expressionHandler',
  ($scope, expressionHandler) => {
      $scope.runQuery = function() {
          if (!$scope.yourQuery) {
            $scope.queryResult = 'Query is empty, please type something.';
          }

          expressionHandler
            .setExpression($scope.yourQuery)
            .then(
                (result) => {
                    $scope.queryResult = result;
                },
                (reason) => {
                    $scope.queryResult = reason;
                }
            );
            
          $scope.yourQuery = '';
      }
  }
]);