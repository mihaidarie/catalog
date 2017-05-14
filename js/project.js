URI.prototype.getParameter = function(key) {
    var paramValue = this.query(true)[key];
    return paramValue;
};

$(document).ready(function() {
    $("header").load('header.html', setupPageElements);
    $("footer").load('footer.html'); 
});

function setupPageElements() {
    loadHeader();
    loadProjectDetails();
    wireUpHandlers();
}

function wireUpHandlers() {
    $("#btnUpload").click(function() {
        // todo: save project details to file
    });

    $("#btnSave").click(function() {
        // todo: save project details to file
    });

    $("#btnCancel").click(function() {
        window.location.href = window.location.href;
    });
}

function loadProjectDetails() {
    var projectsFileName = "database/projects/projects.json";
    var uri = URI(window.location.href);
    var projectId = uri.getParameter('id');

    $.getJSON(projectsFileName, function( data ) {
      
        $.each(data, function(index, project) {
            if(project.Id == projectId) {
                $('#title').val(project.Title);
                $('#subtitle').val(project.Subtitle);
                $('#description').text(project.Description);
                $('#photo').attr('src', project.PhotoPath);
            }
        });

        // todo: form mode setup

    });
}