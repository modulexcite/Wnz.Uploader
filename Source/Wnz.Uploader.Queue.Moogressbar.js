/*
---

name: WNZ.Uploader.Queue.Moogressbar

description: provides progressbar for uploader based on moogressbar

license: MIT-style license.

authors: 
- Dave De Vos

requires:
- /WNZ.Uploader
- /WNZ.Uploader.Queue
- /Moogressbar

provides: [WNZ.Uploader.Queue.Progressbar]

...
*/
Class.refactor(Wnz.Uploader.Queue, {
    add: function(id, detail) {
        this.previous(id, detail);

        var el = this.item[id].progress.empty();
        var moogress = new Element('div', {
            'class': 'moogressbar'
        }).inject(el);

        this.item[id].moogress = new MoogressBar(moogress, {
            bgImage: 'images/green_animated.gif',
            height: 16,
            hide: false
        });
    },

    setProgress: function(id, loaded, total) {
        var i = this.getItem(id);
        var current = Math.round(loaded / total * 100);
        i.moogress.setPercentage(100);
    },

    setProgressError: function(id) {
        this.item[id].moogress.toElement().setStyle('display', 'none');
    }
});

// refactor Base-class
Class.refactor(Wnz.Uploader, {
    render_queue: function() {
        this.previous();

        this.addEvents({
            'error': function(id) {
                this.queue.setProgressError(id);
            }
        });
    }
});