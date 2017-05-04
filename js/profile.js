URI.prototype.getParameter = function(key) {
    var paramValue = this.query(true)[key];
    return paramValue;
};

$(document).ready(function() {
    $('#profileDescription').elastic();
    $('#otherInfo').elastic();
    var uri = URI(window.location.href);
    var profileId = uri.getParameter('id');
    var profileClass = uri.getParameter('class');

    $("header").load('header.html', loadHeader);
    $("footer").load('footer.html');

    renderProfileData(profileId, profileClass);

    $("#btnSave").click(function() {
        // todo: save profile details to file
        alert('saving profile!');
    });

    $("#btnCancel").click(function() {
        window.location.href = window.location.href;
    });
});

function renderProfileData(profileId, profileClass) {

    var peopleFileName = "database/classes/" + profileClass + ".json";

    $.getJSON(peopleFileName, function( data ) {
      
        $.each(data[0].Profiles, function(index, profile) {
            if(profile.Id == profileId) {

                // todo: verify if logged-in and make editable/readonly fields

                $('#firstname').text(profile.FirstName);
                $('#lastname').text(profile.LastName);
                $('#phoneNumber').val(profile.Phone);
                $('#address').val(profile.Address);
                $('#country').val(profile.Country);
                $('#linkedinUrl').val(profile.LinkedIn);
                $('#facebookUrl').val(profile.Facebook);
                $('#job').val(profile.Occupation);
                //$('#').text(profile.Email);
                $('#description').val(profile.Description);
                $('#profilePhoto').attr("src", profile.ProfilePhotoPath);
                $('#recentPhoto').attr("src", profile.RecentPhotoPath);
                $('#otherInfo').text(profile.Other);
                
            }
        });
    });
}

// id, firstName, lastName, phone, address, country, linkedIn, facebook, occupation, email, description, ProfilePhotoPath, RecentPhotoPath