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
    var uploadType = "project";
    setupUploadControls(uploadType);
}

function wireUpHandlers() {
    $("#btnSave").click(function() {
        // todo: save project details to file

    });

    $("#btnCancel").click(function() {
        window.location.href = window.location.href;
    });

    $('#btnBack').on('click', function () {
        window.location.href = 'index.html';
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

    loadPhotos();
}

function loadPhotos() {
    var photosArray = [];
    $.getJSON('/getProjectPhotos', function(photosPathsArray) {
        $.each( photosPathsArray, function( key, elem ) {
            var newPhoto = '<li><img src="' + elem + '" /></li>';
            photosArray.push(newPhoto);
        });

        var allPhotos = photosArray.join("");
        $('<ul />', {
            "id": "allPhotos",
            html: allPhotos
        }).insertAfter("#uploadContent");
    });
}