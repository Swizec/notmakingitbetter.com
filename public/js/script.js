(function($){

    var Card = window.Card = Backbone.Model.extend({

    });

    var CardFormView = window.CardFormView = Backbone.View.extend({
        el: 'form',
        template: new EJS({url: '/client-views/form.ejs'}),

        initialize: function () {
            _.bindAll(this, "render");
            this.model.bind("change", this.render);
            this.model.view = this;
        },

        render: function () {
            var $el = $(this.el);
            $el.html(this.template.render(this.model.toJSON()));

            return $el;
        }
    });

    var AppView = window.AppView = Backbone.View.extend({
        el: $("#main"),

        events: {
        },

        initialize: function () {
            var card_form = new CardFormView({model: new Card({
                image: 'http://25.media.tumblr.com/tumblr_lsrkyvTvqK1r4u63lo1_500.jpg',
                text: "This is a text",
                address: "An address!"
            })});
            console.log(card_form.render());
            //$("#card-form").html(card_form.render());
        }
    });

    var App = window.App = new AppView;

})(jQuery);
