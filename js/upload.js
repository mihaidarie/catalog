URI.prototype.getParameter = function(key) {
    var paramValue = this.query(true)[key];
    return paramValue;
};

$(document).ready(function() {
   
    var uri = URI(window.location.href);
    var profileId = uri.getParameter('id');
    var profileClass = uri.getParameter('class');
    var uploadType = uri.getParameter('type');
      
    $("header").load('header.html', loadHeader);
    $("footer").load('footer.html');

    $('#upload-btn').on('click', function () {

        // todo: verify logged in user to be same as class and ID from URL

        $('#upload-input').click();
        $('.progress-bar').text('0%');
        $('.progress-bar').width('0%');
    });

    $('#btnBack').on('click', function () {

      if(uploadType == 'profile') {
        window.location.href = "profile.html?class=" + profileClass + "&id=" + profileId;
      }

      if(uploadType == 'gallery') {
        window.location.href = "gallery.html";
      }
    });

    $('#upload-input').on('change', function(){

      // todo: verify logged in user to be same as class and ID from URL

      var files = $(this).get(0).files;

      if (files.length > 0) {
        // create a FormData object which will be sent as the data payload in the
        // AJAX request
        var formData = new FormData();

        // loop through all the selected files and add them to the formData object
        for (var i = 0; i < files.length; i++) {
          var file = files[i];

          // add the files to formData object for the data payload
          formData.append('uploads[]', file, file.name);
        }

        var postUrl = "";
        if(uploadType == 'profile') {
          postUrl = '/upload?type=' + uploadType + '&profileId=' + profileId + '&profileClass=' + profileClass;
        }

        if(uploadType == 'gallery') {
          postUrl = '/upload?type=' + uploadType;
        }

        $.ajax({
          url: postUrl,
          type: 'POST',
          data: formData,
          processData: false,
          contentType: false,
          success: function(data) {
              // TODO: change recent photo path in profiles

          },
          complete: function() {
              $('#upload-input').val('');
          },
          xhr: function() {
            // create an XMLHttpRequest
            var xhr = new XMLHttpRequest();

            // listen to the 'progress' event
            xhr.upload.addEventListener('progress', function(evt) {

              if (evt.lengthComputable) {
                // calculate the percentage of upload completed
                var percentComplete = evt.loaded / evt.total;
                percentComplete = parseInt(percentComplete * 100);

                // update the Bootstrap progress bar with the new percentage
                $('.progress-bar').text(percentComplete + '%');
                $('.progress-bar').width(percentComplete + '%');

                // once the upload reaches 100%, set the progress bar text to done
                if (percentComplete === 100) {
                  $('.progress-bar').html('Incarcare reusita!');
                }

              }

            }, false);

            return xhr;
          }
        });

      }
    });
});

