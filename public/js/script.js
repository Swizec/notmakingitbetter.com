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
            "click a.flip": "flip",
            "click .send": "send",
            "focus .image_form input[type=text]": "focus",
            "blur .image_form input[type=text]": "blur",
            "keyup textarea": "limit",
            "paste textarea": "limit",
            "blur textarea": "limit"
        },

        initialize: function () {
            _.bindAll(this, "render", "update_data", "flip", "send", "focus", "blur", "limit");
            this.model.bind("change", this.render);
            this.model.view = this;
        },

        render: function () {
            this.$(this.el).html(this.template.render(this.model.toJSON()));
            this.delegateEvents();

            if (this.model.id) {
                $(".notify_url").val("http://notmakingitbetter.com/ipn/"+this.model.id);
                $(".item_num").val(this.model.id);
                $(".return").val('http://notmakingitbetter.com/sent/'+this.model.id);
                $("#buy").fadeIn();
                $("#magic-button").addClass("visible");
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
            this.$(".send").val("Save");
        },

        focus: function () {
            this.$(".image_form").addClass('focus');
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
        }
    });

    var AppView = window.AppView = Backbone.View.extend({
        el: $("#main"),

        events: {
        },

        initialize: function () {
            var card_form = new CardFormView({model: new Card({
                image: 'http://25.media.tumblr.com/tumblr_lsrkyvTvqK1r4u63lo1_500.jpg',
                text: "",
                address: ""
            })});
            card_form.render();
        }
    });

    var App = window.App = new AppView;

})(jQuery);
