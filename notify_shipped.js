
var _ = require('underscore');
var mongodb = require('mongodb');
var settings = require('../settings');
var mongo = new mongodb.Db((settings.dev) ? 'dev-postcards' : 'postcards',
                           new mongodb.Server('127.0.0.1', 27017, {}));

if (!module.parent) {
    mongo.open(function (err) {
        var transactions = new mongodb.Collection(mongo, 'transactions');

        transactions.find({shipped: true}).toArray(function (err, data) {

        });

    });
}
