/*
---

name: WNZ.Uploader.Queue

description: provides upload queue for WNZ.Uploader

license: MIT-style license.

authors: 
- Dave De Vos

requires:
- /Class.refactor
- /HtmlTable
- /HtmlTable.Zebra
- WNZ.Uploader

provides: [WNZ.Uploader.Queue]

...
*/
Wnz.Uploader.Queue = new Class({

    Implements: [Options, Events],

    item: [],
    table: false,
    complete: 1,
    // indicates if the queue has been uploaded
    options: {
        //onStart: function() {},
        //onPause: function() {},
        //onComplete: function() {},
        'upload_on_select': true,
        'show_controls': true,
        'colspan': 4,
        'elements': {
            'container': 'table',
            'item': 'tr',
            'icon': 'td',
            'file_name': 'td',
            'loader': 'td',
            'size': 'td',
            'progress': 'td',
            'msg': 'td',
            'controls': 'div'
        },
        'text': {
            'progress': '0%'
        },
        'classes': {
            'container': 'upload-queue',
            'item': '',
            'icon': 'upload-icon',
            'wait': 'upload-icon-wait',
            'file_name': 'upload-file',
            'loading': 'upload-icon-spinner',
            'size': 'upload-size',
            'progress': 'upload-progress',
            'msg': 'upload-failed-text',
            'controls': 'upload-controls',
            'ctrl_start': 'icon-ctrl-start',
            'ctrl_pause': 'icon-ctrl-pause',
            'ctrl_hidden': 'icon-ctrl-hidden',
            'extensions': {
                'error': 'upload-icon-error',
                'default': 'upload-icon-file',
                'archive': 'upload-icon-archive',
                'image': 'upload-icon-image',
                'pdf': 'upload-icon-pdf',
                'word': 'upload-icon-word',
                'excel': 'upload-icon-excel'
            }
        }
    },

    initialize: function(container, options) {
        this.setOptions(options);
        this.container = container;

        this.renderQueue();

        if (this.options.show_controls) {
            this.renderControls();
        }
    },

    renderQueue: function() {
        var el = this.options.elements.container,
        cl = this.options.classes.container;

        // make the container && zebra table is possible...
        if (el == 'table' && HtmlTable) {
            this.table = new Element(el, {
                'class': cl
            });
            this.queue = new Element('tbody').inject(this.table.inject(this.container, 'bottom'));
            this.table = new HtmlTable(this.table);
        }
        else {
            this.queue = new Element(el, {
                'class': cl
            }).inject(this.container, 'bottom');
        }
    },
    renderControls: function() {
        var el = this.options.elements,
        cl = this.options.classes,
        ctrl_class,
        hcont,
        fcont,
        els;

        this.control = {
            'paused': !this.options.upload_on_select
        };

        // table		
        if (this.table) {
            this.control.hcont = this.table.set('headers', [{
                content: ' ',
                properties: {
                    'colspan': this.options.colspan
                }
            }]).tds[0].setStyle('display', 'none');
            this.control.fcont = this.table.set('footers', [{
                content: ' ',
                properties: {
                    'colspan': this.options.colspan
                }
            }]).tds[0].setStyle('display', 'none');
        }

        ctrl_class = this.control.paused ? cl.ctrl_start: cl.ctrl_hidden;

        this.control.buttons = new Elements([
        new Element('button', {
            'class': cl.icon + ' ' + ctrl_class
        }).inject(this.control.hcont),
        new Element('button', {
            'class': cl.icon + ' ' + ctrl_class
        }).inject(this.control.fcont)
        ])
        .addEvent('click',
        function(e) {
            if (this.complete === 0) {
                this.control.paused ? this.start() : this.pause();
                this.control.paused = !this.control.paused;
            }
        }.bind(this));

        // when the queue completes we need to do some resetting
        this.addEvent('complete',
        function() {
            this.complete = 1;
            this.control.paused = !this.options.upload_on_select;
            // set paused back to default value
            this.control.buttons.set('class', cl.icon + ' ' + cl.ctrl_hidden);
        }.bind(this));
    },

    add: function(id, detail) {
        var el = this.options.elements,
        cl = this.options.classes,
        txt = this.options.text,
        i;

        this.complete = 0;

        // controls
        if (this.item.length == 0 && this.options.show_controls) {
            this.control.hcont.setStyle('display', '');
            this.control.fcont.setStyle('display', '');
        }

        ext = this.setExtension(detail.ext);

        i = {
            'extension': ext,
            'container': new Element(el.item, {
                'class': cl.item
            }),
            'icon': new Element(el.icon, {
                'class': cl.icon + ' ' + cl.wait
            }),
            'file_name': new Element(el.file_name, {
                'class': cl.file_name,
                'text': detail.name.shorten()
            }),
            'size': new Element(el.size, {
                'class': cl.size,
                'text': (detail.size ? detail.size.toFileSize() : '')
            }),
            'progress': new Element(el.size, {
                'class': cl.size,
                'text': txt.progress
            })
        };

        i.container.adopt([i.icon, i.file_name, i.size, i.progress])
        .inject(this.queue, 'bottom');

        this.item[id] = i;

        if (this.table) {
            this.table.updateZebras();
        }

        ctrl_class = this.control.paused ? cl.ctrl_start: cl.ctrl_hidden;
        this.control.buttons.set('class', cl.icon + ' ' + ctrl_class);
    },

    start: function() {
        var cl = this.options.classes;
        this.control.buttons.set('class', cl.icon + ' ' + cl.ctrl_pause);
        this.fireEvent('start');
    },
    pause: function() {
        var cl = this.options.classes;
        this.control.buttons.set('class', cl.icon + ' ' + cl.ctrl_start);
        this.fireEvent('pause');
    },

    load: function(id) {
        var i = this.item[id],
        cl = this.options.classes;

        i.icon.removeClass(cl.wait).addClass(cl.loading);
    },
    unload: function(id) {
        var i = this.item[id];

        i.icon.removeClass(this.options.classes.loading).addClass(i.extension);
    },
    error: function(id) {
        var i = this.item[id],
        cl = this.options.classes;

        i.icon.removeClass(cl.wait).addClass(cl.extensions.error);
    },

    setProgress: function(id, loaded, total) {
        var text = Math.round(loaded / total * 100) + '%',
        i = this.getItem(id);

        i.progress.set('text', text);
    },
    setExtension: function(ext) {
        x = this.options.classes.extensions;

        switch (ext) {
        case 'jpg':
        case 'png':
        case 'gif':
            return x.image;
            break;
        case 'pdf':
            return x.pdf;
            break;
        case 'xls':
        case 'xlsx':
            return x.excel;
            break;
        case 'doc':
        case 'rtf':
        case 'docx':
            return x.word;
            break;
        case 'zip':
        case 'rar':
            return x.archive;
            break;
        default:
            return x['default'];
            break;
        }
    },

    getItem: function(id) {
        return this.item[id];
    }
});

// refactor Base-class
Class.refactor(Wnz.Uploader, {
    initialize: function(container, options) {
        this.previous(container, options);
        // renders the queue and attaches queue-events
        this.render_queue();
    },

    render_queue: function() {
        this.queue = new Wnz.Uploader.Queue(this.container, {
            'upload_on_select': this.options.upload_on_select,
            onStart: function() {
                this.fireEvent('queueStart');
            }.bind(this),
            onPause: function() {
                this.fireEvent('queuePause');
            }.bind(this)
        });
        this.addEvents({
            'add': function(id) {
                this.queue.add(id, this.handler.getDetail(id));
            }.bind(this),
            'start': function(id) {
                this.queue.load(id);
            }.bind(this),
            'error': function(id) {
                this.queue.error(id);
            },
            'progress': function(id, loaded, total) {
                this.queue.setProgress(id, loaded, total);
            }.bind(this),
            'complete': function(id) {
                this.queue.unload(id);
            }.bind(this),
            'queueStart': function() {
                this.handler.unpauseUpload();
            }.bind(this),
            'queuePause': function() {
                this.handler.pauseUpload();
            }.bind(this),
            'allComplete': function(id) {
                this.queue.fireEvent('complete');
            }.bind(this)
        });
    }
});
