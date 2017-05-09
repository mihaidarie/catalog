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

    $('#changePhoto').click(function() {
        var uri = URI(window.location.href);
        var profileId = uri.getParameter('id');
        var profileClass = uri.getParameter('class');

        window.location.href = "fileUpload.html?type=profile&class=" + profileClass + "&id=" + profileId;
    });
});

function renderProfileData(profileId, profileClass) {

    var peopleFileName = "database/classes/" + profileClass + ".json";

    $.getJSON(peopleFileName, function( data ) {
      
        $.each(data[0].Profiles, function(index, profile) {
            if(profile.Id == profileId) {
                $('#firstname').text(profile.FirstName);
                $('#lastname').text(profile.LastName);
                $('#phoneNumber').val(profile.Phone);
                $('#address').val(profile.Address);
                $('#country').val(profile.Country);
                $('#linkedinUrl').val(profile.LinkedIn);
                $('#facebookUrl').val(profile.Facebook);
                $('#job').val(profile.Occupation);
                $('#email').val(profile.Email);
                $('#description').val(profile.Description);
                $('#profilePhoto').attr("src", profile.ProfilePhotoPath);
                $('#recentPhoto').attr("src", profile.RecentPhotoPath);
                $('#otherInfo').text(profile.Other);
            }
        });
    });

    // todo: verify if logged-in and make editable/readonly fields
    var isUserLoggedIn = checkCookie();
    var isRightUserLoggedIn = false;
    if(isUserLoggedIn == true) {
        var cookieValue = Cookies.getJSON('login');
        var loggedInUserId = cookieValue.UserId;
        var loggedInUserClass = cookieValue.Class;
        
        var uri = URI(window.location.href);
        var profileId = uri.getParameter('id');
        var profileClass = uri.getParameter('class');

        // todo: get admin ID from file

        var adminId = 0;

        isRightUserLoggedIn = (adminId == loggedInUserId) || (loggedInUserId == profileId && loggedInUserClass == profileClass);
    }

    if(isRightUserLoggedIn == false) {
        $('.profile input, textarea').attr("readonly", "readonly");
        $('#buttons').hide();
        $("input[type='checkbox']").hide();
        $('.profileDetails label:nth-child(even)').hide();
        $('#changePhoto').hide();
    } else {
        $("#btnSave").click(function() {
            // todo: save profile details to file

            // todo: verify logged in user to be same as profile ID

            alert('saving profile!');
        });

        $("#btnCancel").click(function() {
            window.location.href = window.location.href;
        });
    }
}

// id, firstName, lastName, phone, address, country, linkedIn, facebook, occupation, email, description, ProfilePhotoPath, RecentPhotoPath