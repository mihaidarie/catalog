$(document).ready(function() {
    loadProjects();
   
})

function loadProjects() {
    
    var projectsFileName = "database/projects/projects.json";

    $.getJSON(projectsFileName, function(data) {
    
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
}

function hookProjectsClick() {
     $("ul[id^='project_']").click(function(e) {
        // todo: navigate to project details page
        alert('certain project clicked');
     });
}