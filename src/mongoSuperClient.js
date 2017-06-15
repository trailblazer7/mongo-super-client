'use strict';

const Connection = require('src/libs/enteties/connection');
const defaultCollection = require('src/defaultCollection.json');
const dbConfig = require('src/dbConfig.js');

class MongoSuperClient {
    constructor() {}

    init() {
        let connection = new Connection();
        connection.insertCollection(dbConfig.defCollectionName, defaultCollection);
    }
}

module.exports = new MongoSuperClient();