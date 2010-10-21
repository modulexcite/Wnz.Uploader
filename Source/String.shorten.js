/*
---

name: String.shorten

description: Method to shorten a string to a given maximum length

license: MIT-style license.

authors: [Thierry Bela]

requires: [Native, $util]

provides: String.shorten

...
*/
String.implement({

    shorten: function(max, end) {
        max = max || 20;
        end = end || 12;

        if (this.length > max) return this.substring(0, max - end - 3) + '... ' + this.substring(this.length - end + 1);
        return this
    }

});
