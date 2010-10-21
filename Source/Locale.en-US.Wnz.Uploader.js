/*
---

script: WNZ.Uploader.English.js

description: Uploader messages in English.

license: MIT-style license

authors:
- Dave De Vos

requires:
- /Locale
- /WNZ.Uploader

provides: [WNZ.Uploader.English]

...
*/

Locale.define('en-US', 'Uploader', {

    buttonText: 'select file...',
    buttonTextLoading: 'uploading...',

    errorExtension: '{file_name} has invalid extension. Only {extensions} are allowed.',
    errorMaxSize: '{file_name} is too large, maximum file size is {max_size_limit}.',
    errorMinSize: '{file_name} is too small, minimum file size is {min_size_limit}.',
    errorEmpty: '{file_name} is empty, please select files again without it.',

    warningLeave: 'The files are being uploaded, if you leave now the upload will be cancelled.',

    dragDropText: 'or drop file to upload'

});