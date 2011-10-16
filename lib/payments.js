
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
    }

};



function confirm(data) {
    return (data.receiver_email == 'swizec@notmakingitbetter.com');
}
