angular.module('app').factory('expressionHandler', [
  '$q',
  'mongoQueryAdapter',
  function($q, mongoQueryAdapter) {

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
                     and: [],
                     or: []
                 };

                 function _bufferTranspose() {
                    if (buffer.and.length) {
                        buffer.and.push( buffer.condBuffer.shift() );
                    }

                    if (buffer.or.length) {
                        buffer.or.push( buffer.condBuffer.shift() );
                    }
                 }

                 for (let part of _this._expression) {
                     if (KEYWORDS.indexOf(part) > -1) {
                         break;
                     }
                      
                     part = _strTrim(part);

                     if (part === '=' && buffer.prev) {
                        let prev = buffer.prev;
                        buffer.condBuffer.push({});
                        buffer.condBuffer[0][prev] = null;
                     }

                     if (buffer.prev === '=' && buffer.condBuffer.length) {
                         let condObject = buffer.condBuffer[0];
                         let key = Object.keys(condObject)[0];
                         key && (condObject[key] = part);

                        _bufferTranspose();
                     }

                     if (MONGO_SYNTAX[part]) {
                        let operation = MONGO_SYNTAX[part];

                        buffer.condBuffer.push({});
                        buffer.condBuffer[0][buffer.prev] = {};
                        buffer.condBuffer[0][buffer.prev][operation] = null;
                     }

                     if (MONGO_SYNTAX[buffer.prev] && buffer.condBuffer.length) {
                        let condObject = buffer.condBuffer[0];
                        let key = Object.keys(condObject)[0];
                        let operation = MONGO_SYNTAX[buffer.prev];

                        condObject[key][operation] = part;

                        _bufferTranspose();
                     }

                     if (part === 'and' &&  buffer.condBuffer.length) { buffer.and.push( buffer.condBuffer.shift() ); }
                     if (part === 'or' && buffer.condBuffer.length)  { buffer.or.push( buffer.condBuffer.shift() ); }

                     buffer.prev = part;
                 }

                 /**
                  * Set condition data from buffer to PARAMS with Mongo syntax 
                  */
                 if (buffer.and.length) {
                    let conditionObject = {};

                    for (let obj of buffer.and) {
                        Object.assign(conditionObject, obj);
                    }

                    PARAMS['where']['value'] = conditionObject;
                 }

                 if (buffer.or.length) {
                    PARAMS['where']['value'] = {
                        '$or' : buffer.or
                    };
                 }

             } else {
                 return 'Wrong WHERE statement.';
             }
        }

        /**
         * ORDER BY statement analysis
         */
        PARAMS['order_by']['analysis'] = function() {
            let orderIndex = _this._expression.indexOf('order');
            let byIndex = _this._expression.indexOf('by');

            if (byIndex - orderIndex == 1) {
                // Slice expression from next elem after 'order by'
                 _this._expression = _this._expression.slice(byIndex+1);

                 let buffer = null;
                 let orderObject = {};
                 for (let part of _this._expression) {
                     if (KEYWORDS.indexOf(part) > -1) {
                         break;
                     }

                     part = _strTrim(part);

                     if (buffer && buffer != 'asc' && buffer != 'desc') {
                         if (part == 'asc' || (part != 'asc' && part != 'desc') ) {
                            orderObject[buffer] = 1;
                         }

                         if (part == 'desc') {
                             orderObject[buffer] = -1;
                         }
                     }

                     buffer = part;
                 }

                 PARAMS['order_by']['value'] = orderObject;
            } else {
                return 'Wrong ORDER BY statement.';
            }
        }
        
        /**
         * SKIP statement analysis
         */
        PARAMS['skip']['analysis'] = function() {
            let index = _this._expression.indexOf('skip');
             if (index > 0) {
                 let target = _this._expression[index+1];
                 target && ( PARAMS['skip']['value'] = Number(_strTrim(target)) );
             } else {
                 return 'Wrong SKIP statement.';
             }
        }
        
        /**
         * LIMIT statement analysis
         */
        PARAMS['limit']['analysis'] = function() {
            let index = _this._expression.indexOf('limit');
             if (index > 0) {
                 let target = _this._expression[index+1];
                 target && ( PARAMS['limit']['value'] = Number(_strTrim(target)) );
             } else {
                 return 'Wrong LIMIT statement.';
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

             mongoQueryAdapter
            .setQueryParams(this._params)
            .then(
                (result) => {
                    //$scope.queryResult = result;
                },
                (reason) => {
                    //$scope.queryResult = reason;
                }
            );
        }
    }

    return new ExpressionHandler();
  }
]);
