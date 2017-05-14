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
    $('#btnBack').on('click', function () {
        window.location.href = 'index.html';
    });

    $('#btnRemove').click(function() {
        var checkedImagesNames = [];
        $.each($('#allPhotos input:checked'), function(i, elem) {
            var imagePath = $(this).siblings('img').attr('src');
            var photoName = imagePath.replace(/^.*[\\\/]/, '');
            checkedImagesNames.push(photoName);
        });
        
        if(checkedImagesNames.length > 0) {
            var postUrl = "/removeProjectPhoto";
            $.ajax({
                url: postUrl,
                type: 'POST',
                data: JSON.stringify(checkedImagesNames),
                contentType: 'application/json',
                error: function(jqXHR, textStatus, errorThrown ) {
                    alert('jqXHR: ' + jqXHR + " textStatus: " + textStatus + " errorThrown: " + errorThrown);
                },
                success: function() {
                    loadProjectPhotos();
                },
                complete: function() {
                    console.log("completed!");
                }
            });
        }
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

        setupFormMode();
    });

    loadProjectPhotos();
}

function setupFormMode() {
    var isAdminUserLoggedIn = isAdminLoggedIn();

    if(isAdminUserLoggedIn) {        
        $('#uploadContent').show();
        $(':checkbox').show();
    }
    else {       
        $('#uploadContent').hide();
        $(':checkbox').hide();
    }
}

function loadProjectPhotos() {
    var photosArray = [];

    $.getJSON('/getProjectPhotos', function(photosPathsArray) {
        $.each( photosPathsArray, function( key, elem ) {
            var newPhoto = '<li><img src="' + elem + '" /><input type="checkbox" /></li>';
            photosArray.push(newPhoto);
        });

        $('#projectDetails').children("#allPhotos").remove();

        var allPhotos = photosArray.join("");
        $('<ul />', {
            "id": "allPhotos",
            html: allPhotos
        }).insertAfter("#uploadContent");
    });
}