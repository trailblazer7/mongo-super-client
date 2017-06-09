'use strict';

const Connection = require('src/libs/enteties/connection');
const defaultCollection = require('src/defaultCollection.json');

class MongoSuperClient {
    constructor() {}

    init() {
        let connection = new Connection();
        connection.insertCollection('humans', defaultCollection);
    }
}

module.exports = new MongoSuperClient();