/*
---

name: WNZ.Uploader.Message.Notimoo

description: provides notimoo messaging for uploader

license: GNU GPL 2 or later, see license.txt.

authors: 
- Dave De Vos

requires:
- /Class.refactor
- Wnz.Uploader
- Notimoo

provides: [Wnz.Uploader.Message.Notimoo]

...
*/

// makes Notimoo work on MooTools 1.3 withouth compat
Class.refactor(Notimoo, {

    initialize: function(options) {
        this.options.parent = $(document.body);
        if (options) {
            if (options.parent) options.parent = $(options.parent);
            this.setOptions(options);
        }

        var manager = this;

        // Track scroll in parent element
        this.options.parent.addEvent('scroll',
        function() {
            clearTimeout(this.scrollTimeOut);
            this.scrollTimeOut = (function() {
                manager._relocateActiveNotifications(manager.TYPE_RELOCATE_SCROLL)
            }).delay(200);
        },
        this);

        window.addEvent('scroll',
        function() {
            clearTimeout(manager.scrollTimeOut);
            manager.scrollTimeOut = (function() {
                manager._relocateActiveNotifications(manager.TYPE_RELOCATE_SCROLL)
            }).delay(200);
        });

        // Insert default element into array
        this.elements.push(
        this.createNotificationElement(this.options)
        );

    }

});

Class.refactor(Wnz.Uploader.Message, {

    initialize: function() {
        this.previous();
        // Notimoo instance
        this.notimoo = new Notimoo({
            locationVType: 'bottom',
            locationHType: 'right'
        });
    },

    set: function(id, response) {
        this.previous(id, response);

        var cl;

        switch (response.code) {
        case 'success':
            cl = 'notimoo notimoo-success';
            break;
        default:
            cl = 'notimoo notimoo-error';
            break;
        }

        // Showing a notification that does not disappear using a custom class.
        this.notimoo.show({
            message: response.msg,
            customClass: cl
        });
    }

});
