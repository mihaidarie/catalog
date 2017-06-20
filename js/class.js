URI.prototype.getParameter = function(key) {
    var paramValue = this.query(true)[key];
    return paramValue;
};

$(document).ready(loadClassProfiles);

function afterLoadHeader() {
    loadHeader();
    loadClassInfo();
}

function loadClassProfiles() {
    $("header").load('Header.html', afterLoadHeader);
    $("footer").load('Footer.html');
}

function loadClassInfo() {
    var uri = URI(window.location.href);
    var className = uri.getParameter("name");
    
    var classFileName = "database/classes/" + className + ".json";

    $.getJSON(classFileName, function( data ) {
      
        var items = [];
        $.each(data, function(index, classDetails) {

            items.push( "<div id='classDescription'><textarea class='description'>" + 
                classDetails.Description + "</textarea><button class='roundedCorners' id='saveDescription'>" +
                "Salveaza descriere</button><label id='result'></label></div>" );

            $.each(classDetails.Profiles, function(index2, profile) {

                var profileId = "personprofile" + profile.Id;
                items.push( "<div data-id='" + profile.Id + "' id='" + profileId + "'><img src=" + profile.ProfilePhotoPath + 
                    "></img><label>" + profile.FirstName + " " + profile.LastName + "</label></div>" );
            });
        });
        
        $( ' <div/>', {
            "class": "profilesList",
            html: items.join("")
        }).prependTo("#profiles");

        hookProfileClick();

        var isAdminLogged = isAdminLoggedIn();
        if(isAdminLogged == false) {
            $('.description').attr('readonly', 'readonly');
            $('#saveDescription').hide();
        } else {
            $('#saveDescription').show();
            $('#saveDescription').click(function() {
                if(isAdminLogged == true) {
                    // post description to server
                    
                    var inputDescription = $('.description').val();
                    var uri = URI(window.location.href);
                    var className = uri.getParameter("name");

                    var postedData = JSON.stringify( { description : inputDescription });
                    var postUrl = "/saveClass?className=" + className;
                    $.ajax({
                        url: postUrl,
                        type: 'POST',
                        data: postedData,
                        contentType: 'application/json',
                        error: function(jqXHR, textStatus, errorThrown ) {
                            $('#result').text('Salvare esuata! Contactati administratorul.');
                            $('#result').css('color', 'red');
                            scrollToDescription();
                            resetResultMessage();
                        },
                        success: function() {
                            console.log("success!");
                            $('#result').text('Salvare reusita!');
                            $('#result').css('color', 'green');
                            scrollToDescription();
                            resetResultMessage();
                        },
                        complete: function() {
                            console.log("completed!");
                        }
                    });
                } else {
                    $('#result').text('Va rugam sa va logati.');
                    scrollToDescription();
                    $('#result').css('color', 'red');
                }
            });
        }
    });
}

function scrollToDescription() {
    var scrollTo = $('#classDescription');
    var scrollTopPosition = scrollTo.position().top;
    $('html, body').animate({
        scrollTop: scrollTopPosition },
        2000
    );
}

function hookProfileClick() {
    $("div[id^='personprofile']").click(function(e) {
        var uri = URI(window.location.href);
        var className = uri.getParameter("name");
        var elementId = this.id;
        var profileId = this.getAttribute("data-id");
        window.location.href = "Profile.html?class=" + className + "&id=" + profileId;
        e.stopPropagation();
    });
}