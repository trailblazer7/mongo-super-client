angular.module('app').controller('queryCtrl', [
  '$scope',
  'expressionHandler',
  'mongoQueryAdapter',
  ($scope, expressionHandler, mongoQueryAdapter) => {
      $scope.runQuery = function() {
          if (!$scope.yourQuery) {
            $scope.queryResult = 'Query is empty, please type something.';
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
                                $scope.queryResult = error.message; 
                            }
                        );
                },
                (error) => {
                    $scope.queryResult = error.message;
                }
            );
            
          $scope.prevQuery = $scope.yourQuery;
          $scope.yourQuery = '';
      }
  }
]);