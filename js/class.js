URI.prototype.getParameter = function(key) {
    var paramValue = this.query(true)[key];
    return paramValue;
};

$(document).ready(loadClassProfiles);

function loadClassProfiles() {
    $("header").load('header.html', wireupHeaderButtons);

    var uri = URI(window.location.href);
    var className = uri.getParameter("name");
    
    var classFileName = "database/classes/" + className + ".json";

    $.getJSON(classFileName, function( data ) {
      
        var items = [];
        $.each(data, function(index, classDetails) {

            items.push( "<p>" + classDetails.Description + "</p>" );

            $.each(classDetails.Profiles, function(index2, profile) {

                var profileId = "personprofile" + profile.Id;
                items.push( "<div data-id='" + profile.Id + "' id='" + profileId + "'><img src=" + profile.PhotoPath + 
                    "></img><label>" + profile.LastName + " " + profile.FirstName + "</label></div>" );
            });
        });
        
        $( "<div/>", {
            "class": "my-new-list",
            html: items.join("")
        }).appendTo("#profiles");

        hookProfileClick();
    });
}

function hookProfileClick() {
    $("div[id^='personprofile']").click(function(e) {
        var elementId = this.id;
        var profileId = this.getAttribute("data-id");
        window.location.href = "profile.html?id=" + profileId;
        e.stopPropagation();
    });
}