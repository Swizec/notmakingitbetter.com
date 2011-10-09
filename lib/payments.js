
var _ = require('underscore');
var mongodb = require('mongodb');
var mongo = new mongodb.Db('postcards', new mongodb.Server('127.0.0.1', 27017, {}));

var postcards = require('./postcards');

module.exports = {

    process: function (id, data, callback) {
        if (confirm(data)) {

            mongo.open(function (err) {
                mongo.collection('transactions', function (err, transactions) {
                    is_processed(data.txn_id, transactions, function (err, yes) {
                        if (!yes) {
                            transactions.insert(_.extend({postcard: id,
                                                          processed_at: new Date()},
                                                         data),
                                                {safe: true},
                                                function (err) {
                                                    postcards.sent(id);
                                                    callback();
                                                });
                        }else{
                            callback();
                        }
                    });
                });

            });
        }else{
            callback();
        }
    }

};



function confirm(data) {
    return data.payment_status == 'Completed' && data.receiver_email == 'swizec@notmakingitbetter.com';
}

function is_processed(id, transactions, callback) {
    transactions.findOne({'paypal_id': id},
                         function (transaction) {
                             callback(transaction);
                         });
}
