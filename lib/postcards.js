
var _ = require('underscore');
var mongodb = require('mongodb');
var settings = require('../settings');
var mongo = new mongodb.Db((settings.dev) ? 'postcards' : 'postcards',
                           new mongodb.Server('127.0.0.1', 27017, {}));

module.exports = {

    create: function (data, callback) {
        mongo.open(function (err) {
            var postcards = new mongodb.Collection(mongo, 'postcards');
            var card = generate(data);
            card.created = new Date();
            postcards.insert(card,
                             function (err, docs) {
                                 mongo.close();
                                 callback(null, docs[0]._id, card.created);
                             });
        });
    },

    update: function (id, data, callback) {
        mongo.open(function (err) {
            var postcards = new mongodb.Collection(mongo, 'postcards');
            var object = {};

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
            cards.sort({created: -1, last_change: -1}).limit(40);
            cards.toArray(function (err, cards) {
                mongo.close();
                callback(err, cards.map(function(card) {
                    card.id = card._id;
                    return card;
                }));
            });
        });
    },

    for_curation: function (callback) {
        mongo.open(function (err) {
            var postcards = new mongodb.Collection(mongo, 'postcards');

            var cards = postcards.find();
            cards.sort({last_change: -1});
            cards.toArray(function (err, cards) {
                mongo.close();
                callback(err, cards.map(function(card) {
                    card.id = card._id;
                    return card;
                }));
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
    var object = {};
    _.map(_.without(_.keys(data), "id", "_id", "last_change"),
          function (k) {
              object[k] = data[k];
          });
    return _.extend({last_change: new Date()},
                    object);
}
