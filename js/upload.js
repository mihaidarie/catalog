function setupUploadControls(uploadType, profileId, profileClass) {
    $('#upload-btn').on('click', function () {
        $('#upload-input').click();
        resetProgressBar();
    });

    $('#upload-input').on('change', function() {
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

        if(uploadType == 'gallery' || uploadType == 'project') {
          postUrl = '/upload?type=' + uploadType;
          if(uploadType == 'project') {
            postUrl = postUrl + '&projectId=' + profileId;
          }
        }

        $.ajax({
          url: postUrl,
          type: 'POST',
          data: formData,
          processData: false,
          contentType: false,
          success: function(data) {
              if(uploadType == 'project' && loadProjectPhotos) {
                setTimeout(function() {
                  loadProjectPhotos(profileId);
                }, 2000);
              }
          },
          error: function(e) {
            if(e.status == 401) {
              $('.progress-bar').html('Incarcare esuata! Va rugam sa va logati.');
              $('.progress-bar').css('background-color', 'red');
              setTimeout(function() {
                location.href = "index.html";
              }, 5000);
            } else {
              $('.progress-bar').html('Incarcare esuata! Contactati administratorul.');
              $('.progress-bar').css('background-color', 'red');
            }
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
                  setTimeout(resetProgressBar, 5000);
                }

              }

            }, false);

            return xhr;
          }
        });
      }
    });
}

function resetProgressBar() {
  $('.progress-bar').text('0%');
  $('.progress-bar').width('0%');
}