angular.module('app').directive('result', [
  function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: __dirname + '/directives/result/result.html',
      controller: 'resultCtrl'
    };
  }
]);