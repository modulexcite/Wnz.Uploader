/*
---

name: Wnz.Uploader

description: Provides uploader interface with handler based on browser features

license: GNU GPL 2 or later, see license.txt.

authors: 
- Dave De Vos

requires:
- core:1.3
- /Number.toFileSize
- /Object.Extras
- /Locale
- Locale.en-US.Wnz.Uploader

provides: [Wnz.Uploader]

...

inspiration:
- Andrew Valums (http://github.com/valums/file-uploader/)
- Thierry Bela (http://github.com/tbela99/uploadManager/)

*/
Wnz.Uploader = new Class({

    Implements: [Options, Events],

    HTML5: false,

    options: {
        // events
        //onAdd: function(id, detail) {},
        //onStart: function(id) {},
        //onProgress: function(id, loaded, total) {},
        //onComplete: function(id, response) {},
        //onAllComplete: function() {},
        action: '/upload.php',
        params: {},

        // switches
        upload_on_select: false,
        multiple: true,
        // if supported by the Browser, this will allow multiple-file-select
        max_connections: 1,
        // I prefer not setting this value too high, because of stability and out_of_memory-issues (FF)
        // in general I think it delivers better performance to make a serial upload i.s.o. parallel upload
        // validation
        allowed_extensions: [],
        max_size_limit: 2097152,
        // size limit in bytes ex. 2 * 1024 * 1024
        min_size_limit: 0,

        'classes': {
            'button': 'upload-button',
            'input': 'opa-0',
            'loading': 'upload-icon-spinner',
            'drop_text': 'upload-drop-text',
            'drop_active': 'upload-drop-area-active'
        }
    },

    initialize: function(container, options) {
        this.setOptions(options);
        this.container = document.id(container);

        this.featureSniff();
        this.renderUploadButton();
        this.renderDragDrop();
        this.setHandler();
        this.setMsgHandler();
        this.preventLeaveInProgress();
    },

    // html5 feature sniff sniff
    featureSniff: function() {
        this.HTML5 = (
        'multiple' in new Element('input[type=file]') &&
        typeof File != "undefined" &&
        typeof(new XMLHttpRequest()).upload != "undefined");
    },
    // Sets the handler based on the features (Can be HTML5-type or fallback IFrame for older crap)
    setHandler: function() {
        var self = this,
        o = this.options,
        url = Object.getLength(o.params) > 0 ? o.action + '?' + Object.toQueryString(o.params) : o.action,
        handler_obj = this.HTML5 ? 'Xhr': 'Form';

        this.handler = new Wnz.Uploader[handler_obj]({
            'action': url,
            'max_connections': o.max_connections,
            onStart: function(id) {
                this.button.load();
                this.fireEvent('start', id);
            }.bind(this),
            onProgress: function(id, loaded, total) {
                this.fireEvent('progress', [id, loaded, total]);
            }.bind(this),
            onComplete: function(id, response) {
                this.msg.set(id, response);
                this.fireEvent('complete', [id, response]);
            }.bind(this),
            onAllComplete: function() {
                this.button.unLoad();
                this.fireEvent('allComplete');
                this.button.reset();
            }.bind(this)
        });
    },
    setMsgHandler: function() {
        this.msg = new Wnz.Uploader.Message();
    },

    // Creates the Upload Button and hidden file-input
    renderUploadButton: function() {
        var o = this.options;
        this.button = new Wnz.Uploader.Button(this.container, {
            'multiple': o.multiple && this.HTML5,
            'classes': {
                'button': o.classes.button,
                'input': o.classes.input,
                'loading': o.classes.loading
            },
            onChange: function(input) {
                if (this.HTML5) {
                    this.uploadFileList(input.files);
                }
                else {
                    this.uploadFile(input);
                }
            }.bind(this)
        });
    },
    renderDragDrop: function() {
        if (this.HTML5) {
            new Wnz.Uploader.DragDrop(this.container, {
                'classes': {
                    'drop': this.options.classes.drop,
                    'active': this.options.classes.active
                },
                onDrop: function(file) {
                    this.uploadFile(file);
                }.bind(this)
            });
        }
    },

    // upload
    uploadFileList: function(files) {
        for (var i = 0; i < files.length; i++) {
            this.uploadFile(files[i]);
        }
    },
    uploadFile: function(file) {
        var id = this.handler.add(file),
        detail = this.handler.getDetail(id),
        valid;

        this.fireEvent('add', [id, detail]);

        valid = this.validate(id, detail);

        // client-side invalid error
        if (!valid) {
            this.handler.remove(id);
        }
        // do upload
        else {
            if (this.options.upload_on_select) {
                this.handler.upload(id);
            }
        }
    },

    // Validation
    // returns file-extension
    validate: function(id, detail) {
        var error = false;

        if (!this.isAllowedExtension(detail.ext)) {
            error = 'errorExtension';
        }
        else if (detail.size === 0) {
            error = 'errorEmpty';
        }
        else if (detail.size && this.options.max_size_limit && detail.size > this.options.max_size_limit) {
            error = 'errorMaxSize';
        }
        else if (detail.size && detail.size < this.options.min_size_limit) {
            error = 'errorMinSize';
        }

        if (error) {
            this.msg.set(id, {
                code: error,
                msg: this.getErrorMessage(error, id)
            });
            this.fireEvent('error', id);
            return false;
        }
        else {
            return true;
        }
    },
    isAllowedExtension: function(ext) {
        var allowed = this.options.allowed_extensions;

        if (!allowed.length) {
            return true;
        }

        for (var i = 0; i < allowed.length; i++) {
            if (allowed[i].toLowerCase() == ext) {
                return true;
            }
        }

        return false;
    },

    // Error messages for client-side errors
    getErrorMessage: function(code, id) {
        var msg = Locale.get('Uploader.' + code),
        detail = this.handler.getDetail(id),
        variables = {
            file_name: detail.name,
            file_size: detail.size ? detail.size.toFileSize() : detail.size,
            file_ext: detail.ext,
            extensions: this.options.allowed_extensions.join(', '),
            max_size_limit: this.options.max_size_limit.toFileSize(),
            min_size_limit: this.options.min_size_limit.toFileSize()
        };

        return msg.substitute(variables);
    },

    unpauseUpload: function() {
        this.handler.unpauseUpload();
    },
    pauseUpload: function() {
        this.handler.pauseUpload();
    },

    // Attaches unload event
    // try to prevent leaving page when upload is in progress
    preventLeaveInProgress: function() {
        window.addEvent('beforeunload',
        function(e) {
            if (this.files_in_progress) {
                e.stop();
            }
        }.bind(this));
    }
});

Wnz.Uploader.Button = new Class({

    Implements: [Options, Events],

    options: {
        //onChange: function(input){},
        'multiple': false,
        // if set to true adds multiple attribute to file input
        'classes': {
            'button': 'upload-button',
            'input': 'upload-input',
            'loading': 'upload-icon-spinner'
        }
    },

    initialize: function(container, options) {
        this.setOptions(options);
        this.container = container;

        this.el = this.renderButton()
        .setStyles({
            // make button suitable container for input
            position: 'relative',
            overflow: 'hidden',
            direction: 'ltr'
            // Make sure browse button is in the right side in Internet Explorer
        })
        .inject(this.container, 'bottom');

        this.input = this.renderInput();
    },

    toElement: function() {
        return this.el;
    },

    renderButton: function() {
        return new Element('div', {
            'text': Locale.get('Uploader.buttonText'),
            'class': this.options.classes.button
        });
    },
    renderInput: function() {
        var self = this,
        input;

        input = new Element('input', {
            'type': 'file',
            'class': this.options.classes.input,
            'name': this.options.name,
            'styles': {
                'position': 'absolute',
                'right': 0,
                // in Opera only 'browse' button is clickable and it is located at the right side of the input
                'top': 0,
                'z-index': 1,
                'font-size': '118px',
                // 4 persons reported this, the max values that worked for them were 243, 236, 236, 118
                'margin': 0,
                'padding': 0,
                'cursor': 'pointer'
            },
            events: {
                'change': function(e) {
                    self.fireEvent('change', this);
                }
            }
        });

        if (this.options.multiple) {
            input.setAttribute('multiple', 'multiple');
        }

        // IE and Opera, unfortunately have 2 tab stops on file input
        // which is unacceptable in our case, disable keyboard access
        if (window.attachEvent) {
            // it is IE or Opera
            input.set('tabIndex', "-1");
        }

        input.inject(this.el, 'bottom');

        return input;
    },

    load: function() {
        this.el.addClass(this.options.classes.loading).set('text', Locale.get('Uploader.buttonTextLoading'));
    },
    unLoad: function() {
        this.el.removeClass(this.options.classes.loading).set('text', Locale.get('Uploader.buttonText'));
    },

    // recreates the file input
    reset: function() {
        this.input = this.renderInput();
    }
});

Wnz.Uploader.DragDrop = new Class({

    Implements: [Options, Events],

    options: {
        //onDrop: function(files) {},
        'classes': {
            'drop_text': 'upload-drop-text',
            'drop_active': 'upload-drop-area-active'
        }
    },

    initialize: function(container, options) {
        this.setOptions(options);
        this.el = container;

        this.renderDropZone();
        this.setEvents();
    },

    toElement: function() {
        return this.el;
    },

    renderDropZone: function() {
        this.el.adopt(new Element('div', {
            'class': this.options.classes.drop_text
        })
        .adopt(new Element('span', {
            'text': Locale.get('Uploader.dragDropText')
        })));
    },

    setEvents: function() {
        var self = this;

        this.el.addEventListener('dragover',
        function(e) {
            if (this.isValidFileDrag(e)) {
                var effect = e.dataTransfer.effectAllowed;
                if (effect == 'move' || effect == 'linkMove') {
                    e.dataTransfer.dropEffect = 'move';
                    // for FF (only move allowed)
                } else {
                    e.dataTransfer.dropEffect = 'copy';
                    // for Chrome
                }

                e.stopPropagation();
                e.preventDefault();
            }
        }.bind(this), true);

        this.el.addEventListener('dragenter',
        function(e) {
            if (this.isValidFileDrag(e)) {
                this.el.addClass(this.options.classes.drop_active);
            }
        }.bind(this), true);

        this.el.addEventListener('dragleave',
        function(e) {
            if (self.isValidFileDrag(e)) {
                e.stopPropagation();
                var relatedTarget = document.elementFromPoint(e.clientX, e.clientY);
                // do not fire when moving a mouse over a descendant
                if (self.contains(this, relatedTarget)) return;

                self.el.removeClass(self.options.classes.drop_active);
            }
        },
        true);

        this.el.addEventListener('drop',
        function(e) {
            if (this.isValidFileDrag(e)) {
                e.preventDefault();
                this.el.removeClass(this.options.classes.drop_active);
                this.fireEvent('drop', e.dataTransfer.files);
            }
        }.bind(this), true);
    },

    isValidFileDrag: function(e) {
        var dt = e.dataTransfer;
        // do not check dt.types.contains in webkit, because it crashes safari 4
        isSafari = Browser.safari3 || Browser.safari4;

        // dt.effectAllowed is none in Safari 5
        // dt.types.contains check is for firefox
        return dt && dt.effectAllowed != 'none' &&
        (dt.files || (!isSafari && dt.types.contains && dt.types.contains('Files')));
    },

    contains: function(parent, descendant) {
        // compareposition returns false in this case
        if (parent == descendant) return true;

        if (parent.contains) {
            return parent.contains(descendant);
        } else {
            return !! (descendant.compareDocumentPosition(parent) & 8);
        }
    }
});

Wnz.Uploader.Handler = new Class({

    Implements: [Options, Events],

    files_in_progress: 0,
    // number of files being uploaded
    paused: false,

    options: {
        //onStart: function(id) {},
        //onProgress: function(id, fileName, loaded, total){},
        //onComplete: function(id, fileName, response){},
        //onCancel: function(id, fileName){},
        action: '/upload',
        max_connections: 1
        // maximum number of concurrent uploads
    },

    initialize: function(options) {
        this.setOptions(options);
        this.queue = [];
        // holds id's for each file to upload
        this.detail = [];
        // detail-objects for each file
    },

    getDetail: function(id) {
        return this.detail[id];
    },
    setDetail: function(id) {
        var name = this.getName(id);
        this.detail[id] = {
            'name': name,
            'size': this.getSize(id),
            'ext': this.getExtension(name)
        };
    },

    getFirst: function(arr) {
        var i = 0;
        while (i <= arr.length && (arr[i] === undefined || arr[i] === null)) {
            i++;
        }
        if (i <= arr.length) {
            return arr[i];
        } else {
            return false;
        }
    },

    getExtension: function(file_name) {
        return ( - 1 !== file_name.indexOf('.')) ? file_name.replace(/.*[.]/, '').toLowerCase() : '';
    },

    // Removes element from queue, starts next upload
    continueUpload: function(id) {
        var max = this.options.max_connections,
        first = this.getFirst(this.queue);

        if (this.queue.length >= max && !this.paused && first !== false) {
            this.upload(first);
        }
        else if (!this.paused) {
            this.reset();
            this.fireEvent('allComplete');
        }
    },
    unpauseUpload: function() {
        this.paused = false;
        this.continueUpload();
    },
    pauseUpload: function() {
        this.paused = true;
    }
});

Wnz.Uploader.Xhr = new Class({

    Extends: Wnz.Uploader.Handler,

    initialize: function(options) {
        this.parent(options);
        // Wnz.Uploader.Handler
        this.files = [];
        this.xhrs = [];
        // the xhr-objects for each file
    },

    add: function(file) {
        var id = this.files.push(file) - 1;
        // add id to queue
        this.queue.include(id);
        // store details
        this.setDetail(id);

        return id;
    },
    remove: function(id) {
        this.files[id] = null;
        this.xhrs[id] = null;
        this.queue[id] = null;
    },
    reset: function() {
        this.files.empty();
        this.xhrs.empty();
        this.queue.empty();
    },

    // Sends the file identified by id and additional query params to the server
    upload: function(id) {
        // if too many active uploads, wait...
        if (this.files_in_progress <= this.options.max_connections - 1) {
            var file = this.files[id],
            detail = this.getDetail(id),
            self = this,
            xhr,
            response;

            this.files_in_progress++;

            this.fireEvent('start', id);

            // XHR -->
            xhr = this.xhrs[id] = new XMLHttpRequest();

            xhr.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    this.fireEvent('progress', [id, e.loaded, e.total]);
                }
            }.bind(this);
            xhr.onreadystatechange = function(e) {
                if (xhr.readyState == 4) {
                    // the request was aborted/cancelled
                    if (!this.files[id]) return;

                    this.fireEvent('progress', [id, detail.size, detail.size]);
                    // set progress to 100%
                    response = JSON.decode(xhr.responseText);
                    if (xhr.status == 200) {
                        this.fireEvent('complete', [id, response]);
                    }

                    this.remove(id);
                    this.files_in_progress--;
                    this.continueUpload(id);
                }
            }.bind(this);

            var reader = !!window.FileReader;

            if (reader) {
                reader = new FileReader();
                reader.onloadend = function(e) {
                    this.bin = e.target.result;
                    this.sendFile(xhr, detail.name, file);
                }.bind(this);
                reader.readAsBinaryString(file);
            }
            else {
                this.sendFile(xhr, detail.name, file);
            }
        }
    },
    sendFile: function(xhr, name, file) {
        var binary = !!xhr.sendAsBinary;

        xhr.open("POST", this.options.action, true);
        //xhr.setRequestHeader("Content-Type", "application/octet-stream");
        xhr.setRequestHeader('Filename', name);
        xhr.setRequestHeader('Sender', 'XMLHttpRequest');
        //FF
        if (binary) xhr.sendAsBinary(this.bin);
        else xhr.send(file)
    },

    // Helpers
    getName: function(id) {
        var file = this.files[id];
        // fix missing name in Safari 4
        return file.fileName != null ? file.fileName: file.name;
    },
    getSize: function(id) {
        var file = this.files[id];
        return file.fileSize != null ? file.fileSize: file.size;
    }
});

Wnz.Uploader.Form = new Class({

    Extends: Wnz.Uploader.Handler,

    initialize: function(options) {
        this.parent(options);
        // Wnz.Uploader.Handler
        this.inputs = [];
        this.iframes = [];
        this.iframe_names = [];
        this.forms = [];
        this.loaded = [];
    },

    add: function(file) {
        var id = this.inputs.push(file) - 1;
        // render iframe for selected file
        this.iframes[id] = this.renderIframe(id);
        this.iframe_names[id] = this.iframes[id].get('name');
        // add id to queue
        this.queue.include(id);
        // store details
        this.setDetail(id);
        return id;
    },
    remove: function(id) {
        this.loaded[id] = null;
        this.queue[id] = null;
    },
    reset: function() {
        this.inputs.empty();
        this.iframes.empty();
        this.forms.empty();
        this.loaded.empty();
        this.queue.empty();
    },

    upload: function(id) {
        // if too many active uploads, wait...
        if (this.files_in_progress <= this.options.max_connections - 1) {
            var input = this.inputs[id],
            detail;

            if (!input) {
                return false;
            }

            console.log(typeOf(input));

            this.files_in_progress++;

            detail = this.getDetail(id);

            this.fireEvent('start', id);

            this.forms[id] = this.renderForm(id, input);
            this.forms[id].submit();
        }
    },

    renderIframe: function(id) {
        var self = this;

        this.loaded[id] = false;
        return new IFrame({
            //			'id'	: this.options.iframe_name+id,
            //			'name'	: this.options.iframe_name+id,
            'src': 'javascript:false',
            // src="javascript:false;" removes ie6 prompt on https
            'styles': {
                'display': 'none'
            },
            events: {
                'load': function() {
                    self.iframeLoaded(this, id);
                }
            }
        }).inject(document.body);
    },
    renderForm: function(id, input) {
        return new Element('form', {
            'method': 'post',
            'action': this.options.action,
            'target': this.iframe_names[id],
            'enctype': 'multipart/form-data',
            'styles': {
                'display': 'none'
            }
        }).adopt(input).inject(document.body);
    },

    iframeLoaded: function(iframe, id) {
        var doc,
        response;

        // when we remove iframe from dom the request stops, but in IE load event fires
        if (!iframe.parentNode) {
            return;
        }

        doc = iframe.contentDocument || iframe.contentWindow.document;
        response = doc.body.innerHTML;

        if (this.loaded[id] === false && response == 'false') {
            this.loaded[id] = true;
        }
        else if (response !== 'false') {
            this.loaded[id] = true;

            // set progress to 100
            this.fireEvent('progress', [id, 100, 100]);

            // set response
            response = JSON.decode(response);

            // fire complete
            this.fireEvent('complete', [id, response]);

            this.remove(id);

            // clean
            this.iframes[id].destroy();
            this.forms[id].destroy();

            this.inputs[id] = null;
            this.iframes[id] = null;
            this.forms[id] = null;

            this.files_in_progress--;
            this.continueUpload(id);
        }
    },

    getName: function(id) {
        // get input value and remove path to normalize
        return this.inputs[id].value.replace(/.*(\/|\\)/, "");
    },
    getSize: function(id) {
        return false;
    }
});

Wnz.Uploader.Message = new Class({

    initialize: function() {
        this.file = [];
    },

    set: function(id, response) {
        this.file[id] = response;
    },
    get: function(id) {
        return this.file[id];
    }

});
