URI.prototype.getParameter = function(key) {
    var paramValue = this.query(true)[key];
    return paramValue;
};

var oldEmailValue = '';

$(document).ready(function() {
    $('#profileDescription').elastic();
    var uri = URI(window.location.href);
    var profileId = uri.getParameter('id');
    var profileClass = uri.getParameter('class');

    $("header").load('Header.html', loadHeader);
    $("footer").load('Footer.html');

    renderProfileData(profileId, profileClass);

    $('#changePhoto').click(function() {
        var uri = URI(window.location.href);
        var profileId = uri.getParameter('id');
        var profileClass = uri.getParameter('class');

        window.location.href = "FileUpload.html?type=profile&class=" + profileClass + "&id=" + profileId;
    });

    $('#btnPrevious').click(function() {
        var serverMethod = '/getPreviousClassProfile';
        navigateProfile(serverMethod, profileClass, profileId);
    });

    $('#btnNext').click(function() {
        var serverMethod = '/getNextClassProfile';
        navigateProfile(serverMethod, profileClass, profileId);
    });
});

function getProfile(className, currentProfileId, serverMethod, navigationCallback) {
    var url = serverMethod + "?className=" + className + "&currentProfileId=" + currentProfileId;

    $.ajax({
        url: url,
        type: 'GET',
        contentType: 'application/json',
        error: function(jqXHR, textStatus, errorThrown ) {
            console.log('jqXHR: ' + jqXHR + " textStatus: " + textStatus + " errorThrown: " + errorThrown);
            $('#result').text('Navigare esuata! Contactati administratorul.');
            $('#result').css('color', 'red');
            setTimeout(function() {
                $('#result').text('');
            }, 5000);
        },
        success: function(data) {
            navigationCallback(data.ClassName, data.ProfileId);
        },
        complete: function() {
            console.log("completed profile retrieval!");         
    }});
}

function navigateProfile(serverMethod, currentClassName, currentProfileId) {
    if(currentClassName != '' && currentProfileId != '') {
        getProfile(currentClassName, currentProfileId, serverMethod, function(className, profileId) {
                if(className && className != '' && profileId && profileId != '') {
                    location.href = "Profile.html?class=" + className + "&id=" + profileId;
                }
            }
        );
    }
}

function renderProfileData(profileId, profileClass) {

    var peopleFileName = "database/classes/" + profileClass + ".json";

    $.getJSON(peopleFileName, function( data ) {
      
        $.each(data[0].Profiles, function(index, profile) {
            if(profile.Id == profileId) {
                $('#firstname').val(profile.FirstName);
                $('#lastname').val(profile.LastName);
    
                var defaultString = "privat";
                var isRightUserLoggedIn = verifyLoggedInUser();

                $('#phoneNumber').val(profile.Phone);
                $('#country').val(profile.Country);
                $('#linkedinUrl').val(profile.LinkedIn);
                $('#facebookUrl').val(profile.Facebook);
                $('#job').val(profile.Job);
                $('#email').val(profile.Email);
                oldEmailValue = profile.Email;
                $('#description').val(profile.Description);
                
                $('#profilePhoto').attr("src", profile.ProfilePhotoPath);
                var recentPhotoPath = "/images/profiles/large/placeholder.png";
                if(profile.RecentPhotoPath && profile.RecentPhotoPath != '') {
                    $.ajax({
                        url: profile.RecentPhotoPath,
                        type: "HEAD",
                        success: function() {
                            recentPhotoPath = profile.RecentPhotoPath;
                        },
                        error: function () { 
                        },
                        complete: function() {
                            $('#recentPhoto').attr("src", recentPhotoPath);
                        }
                    });
                } else {
                    $('#recentPhoto').attr("src", recentPhotoPath);
                }
                
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
                    profile.FirstName = $('#firstname').val();
                    profile.LastName = $('#lastname').val();
                    profile.Phone = $('#phoneNumber').val();
                    profile.Address = $('#address').val();
                    profile.Country = $('#country').val();
                    profile.LinkedIn = $('#linkedinUrl').val();
                    profile.Facebook = $('#facebookUrl').val();
                    profile.Job = $('#job').val();
                    profile.Email = email;
                    profile.Description = $('#description').val();
                    profile.Other = $('#otherInfo').val();

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
                            console.log('jqXHR: ' + jqXHR + " textStatus: " + textStatus + " errorThrown: " + errorThrown);
                            $('#result').text('Salvare esuata! Contactati administratorul.');
                            $('#result').css('color', 'red');
                            scrollToResult();
                            setTimeout(function() {
                                 $('#result').text('');
                            }, 5000);
                        },
                        success: function() {
                            $('#result').text('Salvat!');
                            $('#result').css('color', 'green');
                            setTimeout(function() {
                                 $('#result').text('');
                            }, 5000);

                            console.log("success!");         
                        },
                        complete: function() {
                            console.log("completed!");         
                        }
                    });  
                } else {
                    $('#result').text('Email-ul este folosit deja!');
                    $('#result').css('color', 'red');
                }
            } else {
                $('#result').text('Salvare esuata! Va rugam sa va logati.');
                $('#result').css('color', 'red');
                
                setTimeout(function() {
                    location.href = "Index.html";
                }, 5000);
            }
        });

        $("#btnCancel").click(function() {
            window.location.href = window.location.href;
        });
    }
}

function validateEmailUnicity(profileId, profileClass, email) {
    
    if(oldEmailValue == email || email == '') {
        return true;
    }
    
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
            console.log('Error validating email unicity! jqXHR: ' + jqXHR + " textStatus: " + textStatus + " errorThrown: " + errorThrown);
            $('#result').text('Salvare esuata! Contactati administratorul.');
            $('#result').css('color', 'red');
            scrollToResult();
            setTimeout(function() {
                    $('#result').text('');
            }, 5000);
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

        var isAdminUserLoggedIn = isAdminLoggedIn();
        isRightUserLoggedIn = (isAdminUserLoggedIn == true) || (loggedInUserId == profileId && loggedInUserClass == profileClass);
    }

    return isRightUserLoggedIn;
}