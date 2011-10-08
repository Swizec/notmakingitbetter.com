(function($){

    var Card = window.Card = Backbone.Model.extend({

    });

    var CardFormView = window.CardFormView = Backbone.View.extend({
        el: 'form',
        template: new EJS({url: '/client-views/form.ejs'}),

        events: {
            "change #image": "new_url"
        },

        initialize: function () {
            _.bindAll(this, "render", "new_url");
            this.model.bind("change", this.render);
            this.model.view = this;
        },

        render: function () {
            this.$(this.el).html(this.template.render(this.model.toJSON()));
            this.delegateEvents();

            return this.el;
        },

        new_url: function () {
            this.model.set({'image': this.$("#image").val()});
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
            card_form.render();
        }
    });

    var App = window.App = new AppView;

})(jQuery);
