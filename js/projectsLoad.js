$(document).ready(function() {
    loadProjects();
   
})

function loadProjects() {
    
    var projectsFileName = "database/projects/projects.json";

    $.getJSON(projectsFileName, function(data) {
    
        var items = [];
        $.each(data, function(index, projectDetails) {
            items.push( "<li id=project_" + projectDetails.Id + ">" + projectDetails.Title + " - " + projectDetails.Subtitle + "</li>" );
        });
        
        var allProjects = items.join("");
        $(allProjects).appendTo("#projects");

        hookProjectsClick();
    });
}

function hookProjectsClick() {
     $("ul li[id^='project_']").click(function(e) {
        var projectId = this.id.substring(this.id.indexOf('project_') + 8);
        location.href = "Project.html?id=" + projectId;
     });
}