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

    $('#btnBack').on('click', function () {

      if(uploadType == 'profile') {
        window.location.href = "profile.html?class=" + profileClass + "&id=" + profileId;
      }

      if(uploadType == 'gallery') {
        window.location.href = "gallery.html";
      }
    });

    setupUploadControls(uploadType, profileId, profileClass);
});

