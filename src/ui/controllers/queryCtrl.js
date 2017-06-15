angular.module('app').controller('queryCtrl', [
  '$scope',
  'expressionHandler',
  'mongoQueryAdapter',
  ($scope, expressionHandler, mongoQueryAdapter) => {
      $scope.runQuery = function() {
          $scope.errorMessage = '';
          $scope.queryResult = '';

          if (!$scope.yourQuery) {
            $scope.errorMessage = 'Query is empty, please type something.';
            return;
          }

          let ExpressionHandler = new expressionHandler();
          
          ExpressionHandler
            .setExpression($scope.yourQuery)
            .then(
                (params) => {
                    mongoQueryAdapter
                        .setQueryParams(params)
                        .then(
                            (result) => { 
                                $scope.queryResult = result; 
                            },
                            (error) => { 
                                $scope.errorMessage = error.message; 
                            }
                        );
                },
                (error) => {
                    $scope.errorMessage = error.message;
                }
            );
            
          $scope.prevQuery = $scope.yourQuery;
          $scope.yourQuery = '';
      }
  }
]);