'use strict';

const Connection = require('./libs/enteties/connection');

class MongoSuperClient {
    constructor() {}

    init() {
        new Connection();
    }
}

module.exports = new MongoSuperClient();