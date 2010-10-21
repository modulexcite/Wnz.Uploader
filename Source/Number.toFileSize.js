/*
---

name: Number.toFileSize

description: Method to convert a number to a multiple of the unit byte

license: MIT-style license.

authors: [Dave De Vos]

credits:
  - Cary Dunn [blog-post](http://web.elctech.com/2009/01/06/convert-filesize-bytes-to-readable-string-in-javascript/)

requires: [Native, $util]

provides: Number.toFileSize

...
*/
Number.implement({

    toFileSize: function() {
        var s = ['bytes', 'kb', 'MB', 'GB', 'TB', 'PB'],
        e = Math.floor(Math.log(this) / Math.log(1024));

        return (this / Math.pow(1024, Math.floor(e))).toFixed(2) + " " + s[e];
    }

});
