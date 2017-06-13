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
                let dbQuery = db.humans.find();

                console.log( dbQuery );

                if (true) {

                }
            });

            let result = `TODO Result: `;
            deferred.resolve(result);
        }

        return deferred.promise;
    }

    return new MongoQueryAdapter();
  }
  ]);