angular.module('app').factory('expressionHandler', [
  '$q',
  function($q) {

    function ExpressionHandler() {
        const KEYWORDS = ['select', 'from', 'where', 'order by', 'skip', 'limit'];
        const PARAMS = {
            'select': { 'value': '*' },
            'from': { 'value': undefined },
            'where': { 'value': undefined },
            'order_by': { 'value': undefined },
            'skip': { 'value': undefined },
            'limit': { 'value': undefined }
        };
        
        const MONGO_SYNTAX = {
            '<>': '$ne',
            '>' : '$gt',
            '>=': '$gte',
            '<' : '$lt',
            '<=': '$lte'
        };

        let _this = this;

        /**
         * SELECT statement analysis
         */
        PARAMS['select']['analysis'] = function() {
            if (_this._expression.indexOf('select') === 0) {
                _this._expression.shift();
                for (let part of _this._expression) {
                        if (part === '*' || part === 'from') {
                            break;
                        }

                        if (typeof PARAMS['select']['value'] == 'string') {
                            PARAMS['select']['value'] = {};
                        }

                        //TODO: field.subfield, field.*
                        PARAMS['select']['value'][_strTrim(part)] = 1;
                }
            } else {
                return 'Wrong SELECT statement.';
            }
        }

        /**
         * FROM statement analysis
         */
        PARAMS['from']['analysis'] = function() {
            let index = _this._expression.indexOf('from');
             if (index > 0) {
                 let target = _this._expression[index+1];
                 target && ( PARAMS['from']['value'] = _strTrim(target) );
             } else {
                 return 'Wrong FROM statement.';
             }
        }

        /**
         * WHERE statement analysis
         */
        PARAMS['where']['analysis'] = function() {
            let index = _this._expression.indexOf('where');
             if (index > 0) {
                 // Slice expression from next elem after 'where'
                 _this._expression = _this._expression.slice(index+1);

                 let buffer = {
                     prev: null, // prev expression part
                     condBuffer: [], // conditions buffer 
                     and: {},
                     or: []
                 };

                 for (let part of _this.expression) {
                     if (KEYWORDS.indexOf(part) > -1) {
                         break;
                     }

                     part = _strTrim(part);

                     if (part === '=' && buffer.prev) {
                        let prev = buffer.prev;
                        buffer.condBuffer.push({prev : null});
                     }

                     buffer.prev = part;
                 }
             } else {
                 return 'Wrong WHERE statement.';
             }
        }

        this._expression = undefined;
        this._params = PARAMS;

         /**
          * String trim
          * @param {String} str
          * @private
        */
        function _strTrim (str) {
            return str.replace(/[',]/g, '');
        }
    }

    ExpressionHandler.prototype.setExpression = function (expression) {
        var deferred = $q.defer();

        if (!expression) {
            deferred.reject('Query expression is empty, please type something.');
        } else {
            this._expression = expression.toLowerCase().split(' ');
            this._parseExpression();

            console.log(this._params);

            let result = `TODO Result: ${expression}`;
            deferred.resolve(result);
        }

        return deferred.promise;
    }

    ExpressionHandler.prototype._parseExpression = function () {
        if (this._expression) {
            _.forEach(this._params, function (params) {
                params.analysis && params.analysis();
            });
        }
    }

    return new ExpressionHandler();
  }
]);
