angular.module('app').factory('expressionHandler', [
  '$q',
  function($q) {

    function ExpressionHandler() {
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

                    PARAMS['select']['value'][_strTrim(part)] = 1;
                }
            } else {
                return new Error('Wrong SELECT statement.');
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
                 return new Error('Wrong FROM statement.');
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
                     if (_this.KEYWORDS.indexOf(part) > -1) {
                         break;
                     }
                      
                     part = _strTrim(part);

                     if (!isNaN(part)) {
                        part = Number(part);
                     }

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
                 if (buffer.and.length || buffer.condBuffer.length) {
                    let conditionObject = {};
                    let _buffer = buffer.and.length ? buffer.and : buffer.condBuffer;

                    for (let obj of _buffer) {
                        Object.assign(conditionObject, obj);
                    }

                    PARAMS['where']['value'] = conditionObject;
                 }

                 if (buffer.or.length) {
                    PARAMS['where']['value'] = {
                        '$or' : buffer.or
                    };
                 }
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
                     if (_this.KEYWORDS.indexOf(part) > -1) {
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
    
    ExpressionHandler.prototype.KEYWORDS = ['select', 'from', 'where', 'order by', 'skip', 'limit'];

    ExpressionHandler.prototype.keywordsToLowerCase = function () {
        if (this._expression && this._expression.length) {
            let words = this.KEYWORDS.concat(['and', 'or', 'asc', 'desc', 'order', 'by']);
            let _expression = this._expression;

            _expression.forEach(function (word, index) {
                word = word.toLowerCase();

                if (words.indexOf(word) > -1) {
                    _expression[index] = word;
                }
            });
        }
    }

    ExpressionHandler.prototype.setExpression = function (expression) {
        var deferred = $q.defer();

        if (!expression) {
            deferred.reject(new Error('Query expression is empty, please type something.'));
        } else {
            this._expression = expression.split(' ');
            this.keywordsToLowerCase();
            let result = this.parseExpression();

            if (result instanceof Error) {
                deferred.reject(`${result.name}: ${result.message}`);
            } else {
                deferred.resolve(this._params);
            }
        }

        return deferred.promise;
    }

    ExpressionHandler.prototype.parseExpression = function () {
        let parseResult;

        _.every(this._params, function (params) {
            if (params.analysis) {
                parseResult = params.analysis(); 

                if (parseResult instanceof Error) {
                    return false;
                }

                return true;
            } 
        });

        return parseResult;
    }

    return ExpressionHandler;
  }
]);
