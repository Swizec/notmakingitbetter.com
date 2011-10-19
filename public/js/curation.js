(function ($) {
    var CardList = window.PostcardList = Backbone.Collection.extend({
        model: Card,
        url: '/for_curation'
    });

    var CardView = window.CardView = Backbone.View.extend({
        tagName: "li",
        template: new EJS({url: '/client-views/curation.ejs'}),

        events: {
            "click .nope": "ban",
            "click .yep": "approve"
        },

        initialize: function () {
            _.bindAll(this, "render");

            this.model.bind("change", this.render);
            this.model.view = this;
        },

        render: function () {
            var $el = this.$(this.el);

            $el.html(this.template.render(this.model.toJSON()));

            $el.removeClass("banned").removeClass("approved");

            if (this.model.get("show_recent")) {
                $el.addClass("approved");
            }else if (this.model.get("banned_from_recent")) {
                $el.addClass("banned");
            }

            return this.el;
        },

        approve: function () {
            this.model.set({"show_recent": true,
                            "banned_from_recent": false});
            this.model.save();
        },

        ban: function () {
            this.model.set({"banned_from_recent": true,
                            "show_recent": false});
            this.model.save();
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
