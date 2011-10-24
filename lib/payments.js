
var _ = require('underscore');
var mongodb = require('mongodb');
var mongo = new mongodb.Db('postcards', new mongodb.Server('127.0.0.1', 27017, {}));

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

            transactions.find({}, {fields: ['postcard']}).toArray(
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
    }

};



function confirm(data) {
    return (data.receiver_email == 'swizec@notmakingitbetter.com');
}
