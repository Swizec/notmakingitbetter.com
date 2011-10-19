
var _ = require('underscore');
var mongodb = require('mongodb');
var mongo = new mongodb.Db('postcards', new mongodb.Server('127.0.0.1', 27017, {}));

module.exports = {

    create: function (data, callback) {
        mongo.open(function (err) {
            var postcards = new mongodb.Collection(mongo, 'postcards');
            postcards.insert(generate(data),
                             function (err, docs) {
                                 mongo.close();
                                 callback(null, docs[0]._id);
                             });
        });
    },

    update: function (id, data, callback) {
        mongo.open(function (err) {
            var postcards = new mongodb.Collection(mongo, 'postcards');
            postcards.update({_id: new mongo.bson_serializer.ObjectID(id)},
                             generate(data),
                             {safe: true},
                             function (err) {
                                 mongo.close();
                                 callback(err);
                             });
        });
    },

    sent: function (id) {
        mongo.open(function (err) {
            var postcards = new mongodb.Collection(mongo, 'postcards');

            postcards.update({_id: new mongo.bson_serializer.ObjectID(id)},
                             {$set: {sent: true}});
            mongo.close();
        });
    },

    recent: function (callback) {
        mongo.open(function (err) {
            var postcards = new mongodb.Collection(mongo, 'postcards');

            var cards = postcards.find({$and: [{$or: [{show_recent: true},
                                                     {sent: true}]},
                                               {$or: [{banned_from_recent: false},
                                                      {banned_from_recent: null}]}]});
            cards.sort({last_change: -1}).limit(40);
            cards.toArray(function (err, cards) {
                mongo.close();
                callback(err, cards);
            });
        });
    },

    for_curation: function (callback) {
        mongo.open(function (err) {
            var postcards = new mongodb.Collection(mongo, 'postcards');

            var cards = postcards.find({curated: null});
            cards.sort({last_change: -1});
            cards.toArray(function (err, cards) {
                mongo.close();
                callback(err, cards);
            });
        });
    },

    get: function (id, callback) {
        mongo.open(function (err) {
            var postcards = new mongodb.Collection(mongo, 'postcards');

            postcards.findOne({_id: new mongo.bson_serializer.ObjectID(id)},
                              function (err, card) {
                                  mongo.close();
                                  callback(err, card);
                              });
        });
    }

};

function generate(data) {
    return _.extend({last_change: new Date()},
                    data);
}
