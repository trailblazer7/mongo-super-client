angular.module('app').factory('mongoQueryAdapter', [
  '$q',
  function($q) {
    const Connection = require('src/libs/enteties/connection');

    function MongoQueryAdapter () {}

    MongoQueryAdapter.prototype.setQueryParams = function (params) {
        var deferred = $q.defer();

        if (!params) {
            deferred.reject('Error: Query params are empty.');
        } else {
            let connection = new Connection();
            connection._createConnection((db) => {
                console.log(params);
                let cursor = db.collection(params.from.value);
                let select = (typeof params.select.value === 'object') ? params.select.value : {};
                let where = (typeof params.where.value === 'object') ? params.where.value : {};  
                
                cursor = cursor.find(where, select);
            
                cursor.each(function (err, doc) {
                    if (doc != null) {
                        console.dir(doc);
                    } else {
                        
                    }
                });
            });

            let result = `TODO Result: `;
            deferred.resolve(result);
        }

        return deferred.promise;
    }

    return new MongoQueryAdapter();
  }
  ]);