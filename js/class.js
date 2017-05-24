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
    $("header").load('header.html', afterLoadHeader);
    $("footer").load('footer.html');
}

function loadClassInfo() {
    var uri = URI(window.location.href);
    var className = uri.getParameter("name");
    
    var classFileName = "database/classes/" + className + ".json";

    $.getJSON(classFileName, function( data ) {
      
        var items = [];
        $.each(data, function(index, classDetails) {

            items.push( "<div id='classDescription'><textarea class='description'>" + classDetails.Description + "</textarea><button class='roundedCorners' id='saveDescription'>Salveaza descriere</button></div>" );

            //items.push( '');

            $.each(classDetails.Profiles, function(index2, profile) {

                var profileId = "personprofile" + profile.Id;
                items.push( "<div data-id='" + profile.Id + "' id='" + profileId + "'><img src=" + profile.ProfilePhotoPath + 
                    "></img><label>" + profile.FirstName + " " + profile.LastName + "</label></div>" );
            });
        });
        
        $( "<div/>", {
            "class": "profilesList",
            html: items.join("")
        }).appendTo("#profiles");

        hookProfileClick();

        var isAdminLogged = isAdminLoggedIn();
        if(isAdminLogged == false) {
            $('.description').attr('readonly', 'readonly');
        }

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
                            //$('#emailResult').text('Trimitere esuata! Contactati administratorul.');
                        },
                        success: function() {
                            console.log("success!");         
                        },
                        complete: function() {
                            console.log("completed!");         
                        }
                    });
            }
        });
    });
}

function hookProfileClick() {
    $("div[id^='personprofile']").click(function(e) {
        var uri = URI(window.location.href);
        var className = uri.getParameter("name");
        var elementId = this.id;
        var profileId = this.getAttribute("data-id");
        window.location.href = "profile.html?class=" + className + "&id=" + profileId;
        e.stopPropagation();
    });
}