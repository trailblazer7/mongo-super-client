angular.module('app').factory('mongoQueryAdapter', [
  '$q',
  function($q) {
    const Connection = require('src/libs/enteties/connection');

    function MongoQueryAdapter () {}

    MongoQueryAdapter.prototype.setQueryParams = function (params) {
        let deferred = $q.defer();

        if (!params) {
            deferred.reject(new Error('Error: Query params are empty.'));
        } else {
            let connection = new Connection();
            connection._createConnection((db) => {
                let result = [];
                let cursor = db.collection(params.from.value);
                let select = (typeof params.select.value === 'object') ? params.select.value : {};
                let where = (typeof params.where.value === 'object') ? params.where.value : {};  
                
                cursor = cursor.find(where, select);

                if (params.limit.value) {
                    cursor = cursor.limit(params.limit.value);
                }

                if (params.skip.value) {
                    cursor = cursor.limit(params.skip.value);
                }

                cursor.each(function (err, doc) {
                    if (doc != null) {
                        result.push(doc);
                    } else {
                        deferred.resolve(result);
                    }
                });
            });
        }

        return deferred.promise;
    }

    return new MongoQueryAdapter();
  }
  ]);