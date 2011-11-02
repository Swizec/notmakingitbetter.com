
var _ = require('underscore');
var mongodb = require('mongodb');
var settings = require('../settings');
var mongo = new mongodb.Db((settings.dev) ? 'dev-postcards' : 'postcards',
                           new mongodb.Server('127.0.0.1', 27017, {}));

var postcards = require('./postcards');

module.exports = {

    process: function (id, data, callback) {
        if (confirm(data)) {

            mongo.open(function (err) {
                var transactions = new mongodb.Collection(mongo, 'transactions');
                transactions.insert(_.extend({postcard: id,
                                              processed_at: new Date()},
                                             data),
                                    {safe: true},
                                    function (err) {
                                        mongo.close();
                                        postcards.sent(id);
                                        callback();
                                    });
            });
        }else{
            callback();
        }
    },

    paid_cards: function (callback) {
        mongo.open(function (err) {
            var transactions = new mongodb.Collection(mongo, 'transactions');
            var postcards = new mongodb.Collection(mongo, 'postcards');

            transactions.find({$or: [{shipped: null,
                                      shipped: false}]},
                              {fields: ['postcard']}).sort({processed_at: -1}).toArray(
                function (err, data) {
                    var ids = data.map(function (datum) {
                        return new mongo.bson_serializer.ObjectID(datum.postcard);
                    });

                    postcards.find({_id: {$in: ids}},
                                   {fields: ['address', 'text', 'image']}).toArray(
                                       function (err, cards) {
                                           callback(cards);
                                       });
                });
        });
    },

    unshipped: function (callback) {
        mongo.open(function (err) {
            var transactions = new mongodb.Collection(mongo, 'transactions');

            transactions.find({shipped: null}).toArray(function (err, data) {
                mongo.close();
                callback(data);
            });
        });
    },

    shipped: function (data) {
        mongo.open(function (err) {
            var transactions = new mongodb.Collection(mongo, 'transactions');

            var ids = data.map(function (datum) {
                return datum._id;
            });

            transactions.update({_id: {$in: ids}},
                                {$set: {shipped: true}},
                                {multi: true},
                                function (err) {

                                });
        });
    }

};



function confirm(data) {
    return (data.receiver_email == 'swizec@notmakingitbetter.com');
}
