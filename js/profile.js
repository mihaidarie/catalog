$(document).ready(function() {
    console.log( "ready!" );
    var profileId = $.url().param('id');
    var profileClass = $.url().param('class');

    // todo: verify if logged-in

    renderProfileData(profileId, profileClass);

    $("header").load('header.html', loadHeader);
    $("footer").load('footer.html');
});

function renderProfileData(profileId, profileClass) {
    alert("profile ID: " + profileId);

    var peopleFileName = "database/people/" + className + ".json";

    $.getJSON(peopleFileName, function( data ) {
      
        var items = [];
        $.each(data, function(index, personDetails) {

            items.push( "<p>" + personDetails.Description + "</p>" );

            $.each(personDetails.Profiles, function(index2, profile) {

                var currentProfileId = "personprofile" + profile.Id;
                
                if(currentProfileId == profileId) {
                    
                }
            });
        });
        
    });
}

// id, firstName, lastName, phone, address, country, linkedIn, facebook, occupation, email, description, smallPhotoPath, largePhotoPath