$(document).ready(function() {
    console.log( "ready!" );
    $("#profiles").load(function() {

        var profileInfo = { Id = 1 };

        var profileId = profileInfo.Id;

        var newProfile;
        newProfile.Id = "profile_" + profileId;
        

        var profilePhoto;

        var profileDescription;

        this.children.add(newProfile);

        $("").click(function() {
            var profileId = this.Id;
            window.URL = "profile\id=" + profileId;
        });
    });
});