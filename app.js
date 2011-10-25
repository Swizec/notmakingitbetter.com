
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();
var ipn = require('paypal-ipn');
var _ = require('underscore');

var postcards = require('./lib/postcards');
var payments = require('./lib/payments');
var notifications = require('./lib/notifications');
var settings = require('./settings');

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
            main_card: cards[Math.round(Math.random()*100)%(cards.length-1)] || {image: ''},
            sent_card: JSON.stringify(''),
            head: 'Postcards are cool! <span>Send one ;)</span>',
            DEV: settings.dev
        });
    });
});

app.post('/card', function (req, res) {
    postcards.create(req.body, function (err, id, created) {
        res.send({id: id,
                  created: created});
    });
});

app.put('/card/:id', function (req, res) {
    postcards.update(req.params.id, req.body, function (err, data) {
        res.send({});
    });
});

app.post('/ipn/:id', function (req, res) {
    ipn.verify(req.body, function (err, msg) {
        if (!err) {
            payments.process(req.params.id,
                             req.body,
                             function (err) {
                                 notifications.email('confirmation',
                                                     _.extend({postcard: req.params.id},
                                                              req.body));
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
            main_card: card,
            head: 'I sent a postcard! <span>Send another ;)</span>',
            DEV: settings.dev
        });
    });
});

app.get('/curation', function (req, res) {
    res.render('curation', {
        recent_cards: JSON.stringify([]),
        sent_card: JSON.stringify(''),
        main_card: {},
        head: "Curate the cards you dawg!",
        DEV: settings.dev,
        CURATION: true
    });
});

app.get('/for_curation', function (req, res) {
    postcards.for_curation(function (err, cards) {
        res.send(cards);
    });
});

app.get('/export', function (req, res) {
    payments.paid_cards(function (cards) {
        res.render('export', {
            cards: cards,
            layout: false
        });
    });
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen((settings.dev) ? 4001 :4000);
  console.log("Express server listening on port %d", app.address().port);
}
