(function ($) {
    var CardList = window.PostcardList = Backbone.Collection.extend({
        model: Card,
        url: '/for_curation'
    });

    var CardView = window.CardView = Backbone.View.extend({
        tagName: "li",
        template: new EJS({url: '/client-views/curation.ejs'}),

        initialize: function () {
            _.bindAll(this, "render");

            this.model.bind("change", this.render);
            this.model.view = this;
        },

        render: function () {
            this.$(this.el).html(this.template.render(this.model.toJSON()));

            return this.el;
        }
    });

    var Cards = window.Cards = new CardList;

    var CurationView = window.CurationView = Backbone.View.extend({
        el: $("#main"),

        events: {
        },

        initialize: function () {
            _.bindAll(this, "reset_cards");

            Cards.bind("reset", this.reset_cards);

            Cards.fetch();
        },

        reset_cards: function (cards) {
            var $ol = this.$("#curation_cards ol:last");
            _.map(cards.models, function (card) {
                var recent = new CardView({model: card});
                $ol.append(recent.render());

                if ($(window).width()-$ol.width() < $ol.children("li:first").width()*($ol.children("li").size()-2)) {
                    $ol = $("<ol></ol>");
                    this.$("#curation_cards").append($ol);
                }
            });
            _.map(cards.models, function (card) {
                var view = new CardView({model: card});
                $ol.append(view.render());
            });
        }
    });

    var Curation = window.Curaton = new CurationView;

})(jQuery);
