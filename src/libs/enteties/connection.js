'use strict';

const MongoClient = require('mongodb').MongoClient;
const dbConfig = require('../../dbConfig');
const defaultCollection = require('../../defaultCollection.json');

class Connection {
    constructor() {
        let client = new MongoClient();
        let connectionString = _getConnectionString();

        client.connect(connectionString, (err, db) => {
            if (err) return console.log(err.message);

            console.info(`Connected: ${connectionString}`);

            _insertCollection(db, () => {
                db.close();
            });
        });
    } 
}

/**
 * @function _insertCollection
 * @param {Db} db
 * @param {function} callback
 * @private
 */
function _insertCollection(db, callback) {
    let collection = db.collection('humans');

    collection.insert(defaultCollection, (err, result) => {
        if (err) return console.log(err.message);
    });
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
