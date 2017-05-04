URI.prototype.getParameter = function(key) {
    var paramValue = this.query(true)[key];
    return paramValue;
};

$(document).ready(loadClassProfiles);

function loadClassProfiles() {
    $("header").load('header.html', loadHeader);
    $("footer").load('footer.html');

    var uri = URI(window.location.href);
    var className = uri.getParameter("name");
    
    var classFileName = "database/classes/" + className + ".json";

    $.getJSON(classFileName, function( data ) {
      
        var items = [];
        $.each(data, function(index, classDetails) {

            items.push( "<p>" + classDetails.Description + "</p>" );

            $.each(classDetails.Profiles, function(index2, profile) {

                var profileId = "personprofile" + profile.Id;
                items.push( "<div data-id='" + profile.Id + "' id='" + profileId + "'><img src=" + profile.ProfilePhotoPath + 
                    "></img><label>" + profile.LastName + " " + profile.FirstName + "</label></div>" );
            });
        });
        
        $( "<div/>", {
            "class": "profilesList",
            html: items.join("")
        }).appendTo("#profiles");

        hookProfileClick();
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