$(document).ready(function() {
    loadProjects();

    $("#projects").click(function() {

    });
})

function loadProjects() {
    var projectsFileName = "database/projects/projects.json";

    $.getJSON(projectsFileName, function( data ) {
      
        var items = [];
        $.each(data, function(index, projectDetails) {
            items.push( "<li id=project_'" + projectDetails.Id + "'>" + projectDetails.Description + "</li>" );
        });
        
        var allProjects = items.join("");
        $(allProjects).appendTo("#projects");

        hookProjectsClick();
    });
}

function hookProjectsClick() {
     $("ul[id^='project_']").click(function(e) {
        // todo: navigate to project details page
     });
}