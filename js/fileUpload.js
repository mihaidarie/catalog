URI.prototype.getParameter = function(key) {
    var paramValue = this.query(true)[key];
    return paramValue;
};

$(document).ready(function() {
   
    var uri = URI(window.location.href);
    var profileId = uri.getParameter('id');
    var profileClass = uri.getParameter('class');
    var uploadType = uri.getParameter('type');
      
    $("header").load('Header.html', loadHeader);
    $("footer").load('Footer.html');

    $('#btnBack').on('click', function () {

      if(uploadType == 'profile') {
        window.location.href = "Profile.html?class=" + profileClass + "&id=" + profileId;
      }

      if(uploadType == 'gallery') {
        window.location.href = "Gallery.html";
      }
    });

    setupUploadControls(uploadType, profileId, profileClass);
});

