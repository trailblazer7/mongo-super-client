angular.module('app').factory('expressionHandler', [
  '$q',
  function($q) {

    function ExpressionHandler() {
        this._expression = undefined;
    }

    ExpressionHandler.prototype.setExpression = function (expression) {
        var deferred = $q.defer();
        expression = expression.trim();

        if (!expression) {
            deferred.reject('Query expression is empty, plese type something.');
        } else {
            this._expression = expression;

            let result = 'TODO Result';
            deferred.resolve(result);
        }

        return deferred.promise;
    }

    return new ExpressionHandler();
  }
]);
