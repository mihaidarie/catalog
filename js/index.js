$(document).ready(function() {
    
    $("header").load('header.html', wireupHeaderButtons);
    $("footer").load('footer.html');

    loadProjects();
});

function loadProjects() {
    
    var projectsFileName = "database/projects/projects.json";

    $.getJSON(projectsFileName, function(data) {
        alert('loaded');

        var items = [];
        $.each(data, function(index, projectDetails) {
            if(projectDetails.Id && projectDetails.Id != '' && projectDetails.Description && projectDetails.Description != '') {
                items.push( "<li id=project_'" + projectDetails.Id + "'>" + projectDetails.Description + "</li>" );
            }
        });
        
        var allProjects = items.join("");
        $(allProjects).appendTo("#projects");

        hookProjectsClick();
    });

    $("#projects").click(function() {
        alert('projects click');
    });
}

function hookProjectsClick() {
     $("ul[id^='project_']").click(function(e) {
        // todo: navigate to project details page
     });
}