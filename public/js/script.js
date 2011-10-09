(function($){

    var Card = window.Card = Backbone.Model.extend({
        url: function () {
            return (!this.id) ? '/card' : '/card/'+this.id;
        }
    });

    var CardFormView = window.CardFormView = Backbone.View.extend({
        el: 'form',
        template: new EJS({url: '/client-views/form.ejs'}),

        events: {
            "change input": "update_data",
            "change textarea": "update_data",
            "submit": "update_data",
            "click a": "flip",
            "click .send": "send"
        },

        initialize: function () {
            _.bindAll(this, "render", "update_data", "flip", "send");
            this.model.bind("change", this.render);
            this.model.view = this;
        },

        render: function () {
            this.$(this.el).html(this.template.render(this.model.toJSON()));
            this.delegateEvents();

            if (this.model.id) {
                $(".notify_url").val("http://notmakingitbetter.com/ipn/?id="+this.model.id);
                $(".item_num").val(this.model.id);
                $("#buy").fadeIn();
            }

            return this.el;
        },

        update_data: function () {
            this.model.set({image: this.$("#image").val(),
                            text: this.$("#text").val(),
                            address: this.$("#address").val()
                           });
        },

        flip: function () {
            this.$(this.el).toggleClass('flip');
        },

        send: function () {
            this.model.save();
            this.$(".send").val("Change");
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
