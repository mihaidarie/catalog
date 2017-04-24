$(document).ready(function() {
    console.log( "ready!" );
    var profileId = $.url().param('id');;
    renderProfileData(profileId);
});

function renderProfileData(profileId) {
    alert("profile ID: " + profileId);
}

// id, firstName, lastName, phone, address, country, linkedIn, facebook, occupation, email, description, smallPhotoPath, largePhotoPath