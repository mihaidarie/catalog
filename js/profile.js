$(document).ready(function() {
    console.log( "ready!" );
    var profileId = $.url().param('id');
    var profileClass = $.url().param('class');

    // todo: verify if logged-in

    renderProfileData(profileId, profileClass);

    $("header").load('header.html', wireupHeaderButtons);
    $("footer").load('footer.html');
});

function renderProfileData(profileId, profileClass) {
    alert("profile ID: " + profileId);
}

// id, firstName, lastName, phone, address, country, linkedIn, facebook, occupation, email, description, smallPhotoPath, largePhotoPath