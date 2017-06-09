'use strict';

const MongoClient = require('mongodb').MongoClient;
const dbConfig = require('src/dbConfig');

class Connection {
    constructor() {} 

    /**
     * @param {Function} callback
     */
    _createConnection(callback) {
        let client = new MongoClient();
        let connectionString = _getConnectionString();

        client.connect(connectionString, (err, db) => {
            if (err) return console.log(err.message);

            console.info(`Connected: ${connectionString}`);
            callback(db);
            db.close();           
        });
    }

    /**
     * Insert collection to database
     * @param {String} name
     * @param {JSON} collection
     * @public
     */
    insertCollection(name, collection) {

        this._createConnection((db) => {
            let coll = db.collection(name);

            coll.insert(collection, (err, result) => {
                if (err) return console.log(err.message);
            });
        });

    }
}

/**
 * @function _getConnectionString
 * @private
 */
function _getConnectionString() {
    let connectionString = 'mongodb://';
        
    if (dbConfig.user && dbConfig.pass) {
        connectionString += (`${dbConfig.user}:${dbConfig.user}@`);
    }

    if (dbConfig.host && dbConfig.port) {
        connectionString += `${dbConfig.host}:${dbConfig.port}`;
    }

    if (dbConfig.dbName) connectionString += `/${dbConfig.dbName}`;

    return connectionString;
}

module.exports = Connection;
