
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();
var ipn = require('paypal-ipn');

var postcards = require('./lib/postcards');
var payments = require('./lib/payments');

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
    postcards.recent(function (err, cards) {
        res.render('index', {
            recent_cards: JSON.stringify(cards),
            sent_card: JSON.stringify(''),
            head: 'Postcards are cool! <span>Send one ;)</span>'
        });
    });
});

app.post('/card', function (req, res) {
    postcards.create(req.body, function (err, id) {
        res.send({id: id});
    });
});

app.put('/card/:id', function (req, res) {
    postcards.update(req.params.id, req.body, function (err) {
        res.send({});
    });
});

app.post('/ipn/:id', function (req, res) {
    ipn.verify(req.body, function (err, msg) {
        if (!err) {
            payments.process(req.params.id,
                             req.body,
                             function (err) {
                                 res.send({});
                             });
        }else{
            res.send({});
        }
    });
});

app.get('/recents',function (req, res) {
    postcards.recent(function (err, cards) {
        res.send(cards);
    });
});

app.get('/sent/:id', function (req, res) {
    postcards.get(req.params.id, function (err, card) {
        res.render('sent', {
            recent_cards: JSON.stringify([]),
            sent_card: JSON.stringify(card),
            head: 'I sent a postcard! <span>Send another ;)</span>'
        });
    });
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(4000);
  console.log("Express server listening on port %d", app.address().port);
}
