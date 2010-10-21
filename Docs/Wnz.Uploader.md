Class: Wnz.Uploader {#Wnz.Uploader}
===================================

Provides flash-less file uploader with iFrame-fallback for older browsers

### Implements:

Options, Events

Wnz.Uploader Method: constructor {#Wnz.Uploader:constructor}
-------------------------------------------------------------

### Syntax:

	var myUploader = new Wnz.Uploader(container[, options]);

### Arguments:

1. container - (mixed) A DOM element or it's id that will contain the upload button
2. options - (object; optional) a key/value set of options

### Options:

* action - (*string*) The target-url where the file will be sent
* params - (*object*) a key/value set of variables that will be appended to the target-url query-string
* upload_on_select - (*boolean*) whether the file will we uploaded immediately on selection 
* multiple - (*boolean*) allow the selection of multiple files
* max_connections - (*integer*) the number of simultaneous connection while uploading a queue
* allowed_extensions - (*array*) the allowed extensions for file-upload
* max_size_limit - (*integer*) the maximum file-size of the file
* min_size_limit - (*integer*) the minimum file-size of the file

### Events:

* onAdd - (*function*) callback fired when a file is added to the upload-queue
* onStart - (*function*) callback fired when a file starts uploading
* onProgress - (*function*) callback fired while file is being sent, will feedback transmitted bytes
* onComplete - (*function*) callback fired when a file has finished uploading
* onAllComplete - (*function*) callback fired when all files in the queue have finished uploading 


Wnz.Uploader Method: pauseUpload {#Wnz.Uploader:pauseUpload}
-------------------------------------------------------------

Pauses the current upload queue, will not pause the current transfer in progress

### Syntax:

	myUploader.pauseUpload();


Wnz.Uploader Method: unpauseUpload {#Wnz.Uploader:unpauseUpload}
-----------------------------------------------------------------

Continues the upload queue when it is paused

### Syntax:

	myUploader.unpauseUpload();


Class: Wnz.Uploader.Message {#Wnz.Uploader.Message}
===================================================

Wnz.Uploader.Message Method: constructor {#Wnz.Uploader.Message:constructor}
-----------------------------------------------------------------------------

This class provides feedback about the upload queue.  This class initially only stores the message without providing visual feedback.  The purpose of
this class is to give you the ability to extend or refactor it for use with your own feedback methods.

### Syntax:

	var myMessage = new Wnz.Uploader.Message();


Wnz.Uploader.Message Method: set {#Wnz.Uploader.Message:set}
-------------------------------------------------------------

### Syntax:

	myMessage.set(id, response);

### Arguments:

1. id - (*integer*) the identifier of the file (provided by the uploader class)
2. response - (*object*) upload response key/value pairs  


Wnz.Uploader.Message Method: get {#Wnz.Uploader.Message:get}
-------------------------------------------------------------

### Syntax:

	myMessage.get(id);

### Arguments:

1. id - (*integer*) the identifier of the file (provided by the uploader class)

### Returns:

* (*object*) upload response key/value pairs


