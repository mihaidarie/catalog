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
    
                var defaultString = "privat";
                var isRightUserLoggedIn = verifyLoggedInUser();

                $('#phoneNumber').val(profile.Phone);
                $('#country').val(profile.Country);
                $('#linkedinUrl').val(profile.LinkedIn);
                $('#facebookUrl').val(profile.Facebook);
                $('#job').val(profile.Job);
                $('#email').val(profile.Email);
                $('#description').val(profile.Description);
                $('#profilePhoto').attr("src", profile.ProfilePhotoPath);
                var recentPhotoPath = "/images/profiles/large/placeholder.png";
                if(profile.RecentPhotoPath && profile.RecentPhotoPath != '') {
                    recentPhotoPath = profile.RecentPhotoPath;
                }
                $('#recentPhoto').attr("src", recentPhotoPath);
                $('#otherInfo').text(profile.Other);
                $('#address').val(profile.Address);
                
                if(isRightUserLoggedIn == false) {
                    if(profile.PhonePublic == false) {
                        $('#phoneNumber').val(defaultString);
                    }
                }

                if(isRightUserLoggedIn == false) {
                    if(profile.AddressPublic == false) {
                        $('#address').val(defaultString);
                    }
                }         

                if(isRightUserLoggedIn == false) {
                    if(profile.CountryPublic == false) {
                        $('#country').val(defaultString);
                    }
                }    

                if(isRightUserLoggedIn == false) {
                    if(profile.LinkedInPublic == false) {
                        $('#linkedinUrl').val(defaultString);
                    }
                }    

                if(isRightUserLoggedIn == false) {
                    if(profile.FacebookPublic == false) {
                        $('#facebookUrl').val(defaultString);
                    }
                }    

                if(isRightUserLoggedIn == false) {
                    if(profile.JobPublic == false) {
                        $('#job').val(defaultString);
                    }
                }    

                if(isRightUserLoggedIn == false) {
                    if(profile.EmailPublic == false) {
                        $('#email').val(defaultString);
                    }
                }

                var phonePublic = false;
                if(profile.PhonePublic) {
                    phonePublic = profile.PhonePublic;
                }

                var addressPublic = false;
                if(profile.AddressPublic) {
                    addressPublic = profile.AddressPublic;
                }

                var countryPublic = false;
                if(profile.CountryPublic) {
                    countryPublic = profile.CountryPublic;
                }

                var linkedInPublic = false;
                if(profile.LinkedInPublic) {
                    linkedInPublic = profile.LinkedInPublic;
                }

                var facebookPublic = false;
                if(profile.FacebookPublic) {
                    facebookPublic = profile.FacebookPublic;
                }

                var jobPublic = false;
                if(profile.JobPublic) {
                    jobPublic = profile.JobPublic;
                }

                var emailPublic = false;
                if(profile.EmailPublic) {
                    emailPublic = profile.EmailPublic;
                }

                $('#phonePublic').attr('checked', phonePublic);
                $('#addressPublic').attr('checked', addressPublic);
                $('#countryPublic').attr('checked', countryPublic);
                $('#linkedInPublic').attr('checked', linkedInPublic);
                $('#facebookPublic').attr('checked', facebookPublic);
                $('#jobPublic').attr('checked', jobPublic);
                $('#emailPublic').attr('checked', emailPublic);
            }
        });
    });

    var isRightUserLoggedIn = verifyLoggedInUser();

    if(isRightUserLoggedIn == false) {
        $('.profile input, textarea').attr("readonly", "readonly");
        $('#buttons').hide();
        $("input[type='checkbox']").hide();
        $('.profileDetails label:nth-child(even)').hide();
        $('#changePhoto').hide();
    } else {
        $("#btnSave").click(function() {
            // save profile details to file

            // verify logged in user to be same as profile ID or to be admin
            $('#result').text('');
            var isRightUserLoggedIn = verifyLoggedInUser();
            if(isRightUserLoggedIn == true) {
                
                var uri = URI(window.location.href);
                var profileId = uri.getParameter('id');
                var profileClass = uri.getParameter('class');
                var email = $('#email').val();

                var isEmailUnique = validateEmailUnicity(profileId, profileClass, email);

                if(isEmailUnique === true) {
                    var profile = {};
                    profile.FirstName = $('#firstname').text();
                    profile.LastName = $('#lastname').text();
                    profile.Phone = $('#phoneNumber').val();
                    profile.Address = $('#address').val();
                    profile.Country = $('#country').val();
                    profile.LinkedIn = $('#linkedinUrl').val();
                    profile.Facebook = $('#facebookUrl').val();
                    profile.job = $('#job').val();
                    profile.Email = email;
                    profile.Description = $('#description').val();
                    profile.Other = $('#otherInfo').text();

                    profile.PhonePublic = $('#phonePublic')[0].checked;
                    profile.AddressPublic = $('#addressPublic')[0].checked;
                    profile.CountryPublic = $('#countryPublic')[0].checked;
                    profile.LinkedInPublic = $('#linkedInPublic')[0].checked;
                    profile.FacebookPublic = $('#facebookPublic')[0].checked;
                    profile.JobPublic = $('#jobPublic')[0].checked;
                    profile.EmailPublic = $('#emailPublic')[0].checked;
                    profile.Id = profileId;

                    var profileJson = JSON.stringify(profile);
                    var postedProfile = { ProfileDetails : profileJson};
                    var postedData = JSON.stringify(postedProfile);

                    var postUrl = "/saveProfile?className=" + profileClass;
                    $.ajax({
                        url: postUrl,
                        type: 'POST',
                        data: postedData,
                        contentType: 'application/json',
                        error: function(jqXHR, textStatus, errorThrown ) {
                            alert('jqXHR: ' + jqXHR + " textStatus: " + textStatus + " errorThrown: " + errorThrown);
                        },
                        success: function() {
                            console.log("success!");         
                        },
                        complete: function() {
                            console.log("completed!");         
                        }
                    });  
                } else {
                    $('#result').text('Email-ul este folosit deja!');
                }
            }
        });

        $("#btnCancel").click(function() {
            window.location.href = window.location.href;
        });
    }
}

function validateEmailUnicity(profileId, profileClass, email) {
    var postedProfile = {
        email: email,
        profileId: profileId, 
        profileClass: profileClass
    };

    var postedData = JSON.stringify(postedProfile);

    var isEmailUnique = false;
    var postUrl = "/validateEmailUnicity";
    $.ajax({
        url: postUrl,
        type: 'POST',
        data: postedData,
        contentType: 'application/json',
        error: function(jqXHR, textStatus, errorThrown ) {
            alert('Error validating email unicity!');
        },
        success: function(result) {
            isEmailUnique = JSON.parse(result).isEmailUnique;  
        },
        complete: function() {
            console.log("completed!");         
        },
        async: false
    }); 

    return isEmailUnique;
}

function verifyLoggedInUser() {
    // verify if logged-in and make editable/readonly fields
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

    return isRightUserLoggedIn;
}