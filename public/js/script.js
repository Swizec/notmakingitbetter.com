(function($){

    var Card = window.Card = Backbone.Model.extend({
        url: function () {
            return (!this.id) ? '/card' : '/card/'+this.id;
        },

        initialize: function() {
            var _this = this;
            this.attributes.changed = false;

            this.bind("change", function () {
                _this.attributes.changed = true;
            });
        }
    });

    var CardFormView = window.CardFormView = Backbone.View.extend({
        el: 'form',
        template: new EJS({url: '/client-views/form.ejs'}),

        step: 'image',

        events: {
            "change input": "update_data",
            "change textarea": "update_data",
            "submit": "update_data",
            "click a.flip": "flip",
            "click .magic-button": "send",
            "focus .image_form input[type=text]": "focus",
            "blur .image_form input[type=text]": "blur",
            "keyup textarea": "limit",
            "paste textarea": "limit",
            "blur textarea": "limit",
            "focus textarea#text": "change_step",
            "focus textarea#address": "change_step"
        },

        initialize: function () {
            _.bindAll(this, "render", "update_data", "flip", "send", "focus", "blur", "limit", "do_send", "change_step");
            this.model.bind("change", this.render);
            this.model.view = this;

            this.change_step();
        },

        render: function () {
            this.$(this.el).html(this.template.render(this.model.toJSON()));
            this.delegateEvents();

            return this.el;
        },

        update_data: function () {
            var image = this.$("#image").val();
            image = (image != '') ? image : this.model.get('image');

            if (image != this.model.get('image')) {
                mpq.track("Changed image");
            }else{
                mpq.track("Updated card");
            }

            var silent = (image == this.model.get('image'));

            this.model.set({image: image,
                            text: this.$("#text").val(),
                            address: this.$("#address").val()
                           },
                           {silent: silent});
        },

        flip: function (event) {
            event.preventDefault();
            var $el = this.$(this.el);
            $el.toggleClass('flip');

            this.step = "text";
            this.change_step();

            mpq.track("Flipped");
        },

        send: function (event) {
            event.preventDefault();

            this.model.save({},
                            {error: function () {
                                alert("Sorry, there was an error saving the postcard :(");
                            },
                             success: this.do_send});
        },

        do_send: function () {
            $(".notify_url").val("http://notmakingitbetter.com/ipn/"+this.model.id);
            $(".item_num").val(this.model.id);
            $(".return").val('http://notmakingitbetter.com/sent/'+this.model.id);

            mpq.track("Buy", {}, function () {
                $("#magic-button-form").submit();
            });
        },

        focus: function () {
            this.$(".image_form").addClass('focus');
            this.step = "image";
        },

        blur: function () {
            this.$(".image_form").removeClass('focus');
        },

        limit: function (event) {
            var $area = $(event.currentTarget);
            var lines = $area.val().split("\n");

            if ($area.attr("id") == "text" && lines.length > 14) {
                lines.pop();
                $area.val(lines.join("\n"));
            }else if ($area.attr("id") == "address" && lines.length > 5) {
                lines.pop();
                $area.val(lines.join("\n"));

            }
            if ($area.attr("id") == "address" && lines.length > 2) {
                this.step = "send";
                this.change_step();
            }
        },

        change_step: function (event) {
            $("section#card li").removeClass("step");
            if (event) {
                this.step = $(event.currentTarget).attr("id");
            }
            $("section#card li[step="+this.step+"]").addClass("step");
        }
    });

    var PostcardList = window.PostcardList = Backbone.Collection.extend({
        model: Card,
        url: '/recents'
    });

    var RecentView = window.RecentView = Backbone.View.extend({
        tagName: "li",
        template: new EJS({url: '/client-views/recent.ejs'}),

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

    var Recents = window.Recents = new PostcardList;

    var AppView = window.AppView = Backbone.View.extend({
        el: $("#main"),

        events: {
        },

        initialize: function () {
            _.bindAll(this, "reset_recent");

            Recents.bind("reset", this.reset_recent);

            Recents.reset(window.recent_cards);

            var card;
            if (typeof(sent_card) != "object") {
                var _card = new Card(main_card);
                card = new Card({
                    image: (_card) ? _card.get('image') : 'http://i.imgur.com/24uzu.jpg',
                    text: "",
                    address: ""
                });
            }else{
                card = new Card({
                    image: sent_card.image,
                    text: sent_card.text,
                    address: ""
                });
            }
            var card_form = new CardFormView({model: card});

            card_form.render();
        },

        reset_recent: function (cards) {
            var $ol = this.$("#recent ol:last");
            _.map(cards.models, function (card) {
                var recent = new RecentView({model: card});
                $ol.append(recent.render());
                if ($(window).width()-$ol.width() < $ol.children("li:first").width()*($ol.children("li").size()-2)) {
                    $ol = $("<ol></ol>");
                    this.$("#recent").append($ol);
                }
            });
        }
    });

    var App = window.App = new AppView;

})(jQuery);
