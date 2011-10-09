
/**
 * Module dependencies.
 */

var express = require('express');
var mongodb = require('mongodb');
var _ = require('underscore');

var app = module.exports = express.createServer();


var mongo = new mongodb.Db('postcards', new mongodb.Server('127.0.0.1', 27017, {}));

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
  });
});

app.post('/card', function (req, res) {
    mongo.open(function (err) {
        mongo.collection('postcards', function (err, postcards) {
            var card = _.extend({last_change: new Date()},
                                 req.body);
            postcards.insert(card, function (err, docs) {
                mongo.close();
                res.send({id: docs[0]._id});
            });
        });
    });
});

app.put('/card/:id', function (req, res) {
    mongo.open(function (err) {
        mongo.collection('postcards', function (err, postcards) {
            var card = _.extend({last_change: new Date()},
                                req.body);
            postcards.update({_id: new mongo.bson_serializer.ObjectID(req.params.id)},
                             card,
                             {safe: true},
                             function (err) {
                                 res.send({});
                             });
        });
    });
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(4000);
  console.log("Express server listening on port %d", app.address().port);
}
