
var email = require('mailer');

var settings = require('../settings');

module.exports = {
    email: function (type, data) {
        var types = {
            confirmation: function (data) {
                return {to: data.payer_email,
                        subject: "You just sent a postcard!",
                        template: "emails/confirmation.txt",
                        data: {name: data.first_name+" "+data.last_name,
                               postcard: data.postcard}};
            },
            shipped: function (data) {
                return {to: data.payer_email,
                        subject: "Postcard shipped!",
                        template: "emails/shipped.txt",
                        data: {name: data.first_name+" "+data.last_name}};
            }};

        mail(types[type](data), function () {
            console.log(arguments);
        });
    }
};

function mail(info, callback) {
    email.send(
        {host: "smtp.sendgrid.net",
         port : "25",
         domain: "smtp.sendgrid.net",
         authentication: "login",
         username: settings.sendgrid.user,
         password: settings.sendgrid.pass,
         to : info.to,
         from : "swizec@postme.me",
         template: info.template,
         data: info.data,
         subject : info.subject
        },
        callback);
};
