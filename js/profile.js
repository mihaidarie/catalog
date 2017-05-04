URI.prototype.getParameter = function(key) {
    var paramValue = this.query(true)[key];
    return paramValue;
};

$(document).ready(function() {
    var uri = URI(window.location.href);
    var profileId = uri.getParameter('id');
    var profileClass = uri.getParameter('class');

    $("header").load('header.html', loadHeader);
    $("footer").load('footer.html');

    renderProfileData(profileId, profileClass);
});

function renderProfileData(profileId, profileClass) {

    var peopleFileName = "database/classes/" + profileClass + ".json";

    $.getJSON(peopleFileName, function( data ) {
      
        $.each(data[0].Profiles, function(index, profile) {
            if(profile.Id == profileId) {

                // todo: verify if logged-in and make editable/readonly fields

                $('#firstname').text(profile.FirstName);
                $('#lastname').text(profile.LastName);
                $('#phoneNumber').text(profile.Phone);
                $('#address').text(profile.Address);
                $('#country').text(profile.Country);
                $('#linkedinUrl').text(profile.LinkedIn);
                $('#facebookUrl').text(profile.Facebook);
                $('#job').text(profile.Occupation);
                //$('#').text(profile.Email);
                $('#description').text(profile.Description);
                $('#profilePhoto').attr("src", profile.ProfilePhotoPath);
                $('#recentPhoto').attr("src", profile.RecentPhotoPath);
            }
        });
    });
}

// id, firstName, lastName, phone, address, country, linkedIn, facebook, occupation, email, description, ProfilePhotoPath, RecentPhotoPath