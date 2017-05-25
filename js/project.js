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
    var uri = URI(window.location.href);
    var projectId = uri.getParameter('id');
    setupUploadControls(uploadType, projectId);
}

function wireUpHandlers() {
    $('#btnBack').on('click', function () {
        window.location.href = 'index.html';
    });

    //$('#upload-btn').click(loadProjectPhotos);
    
    $('#upload-btn').click(function(e) {
        var isAdminUserLoggedIn = isAdminLoggedIn();
        //isAdminUserLoggedIn = false;
        if(isAdminUserLoggedIn == true) {

        }
        else {
            $('#result').text('Incarcare esuata! Va rugam sa va logati.');
            $('#result').css('color', 'red');
            scrollToResult();
            resetResultMessage();
            location.href = "index.html";
        }
    });

    $('#btnRemove').click(function() {
        var checkedImagesNames = [];
        $.each($('#allPhotos input:checked'), function(i, elem) {
            var imagePath = $(this).siblings('a').attr('href');
            var photoName = imagePath.replace(/^.*[\\\/]/, '');
            checkedImagesNames.push(photoName);
        });
        
        var uri = URI(window.location.href);
        var projectId = uri.getParameter('id');

        if(checkedImagesNames.length > 0) {
            var postUrl = "/removeProjectPhoto?projectId=" + projectId;
            $.ajax({
                url: postUrl,
                type: 'POST',
                data: JSON.stringify(checkedImagesNames),
                contentType: 'application/json',
                error: function(jqXHR, textStatus, errorThrown ) {
                    console.log('jqXHR: ' + jqXHR + " textStatus: " + textStatus + " errorThrown: " + errorThrown);
                },
                success: function() {
                    loadProjectPhotos(projectId);
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
            }
        });

        setupFormMode();
    });

    loadProjectPhotos(projectId);
}

function setupFormMode() {
    var isAdminUserLoggedIn = isAdminLoggedIn();

    if(isAdminUserLoggedIn == true) {        
        $('#uploadContent').show();
        $(':checkbox').show();
    }
    else {       
        $('#uploadContent').hide();
        $(':checkbox').hide();
    }
}

function loadProjectPhotos(projectId) {
    var photosArray = [];

    $.getJSON('/getProjectPhotos?projectId=' + projectId, function(photosPathsArray) {
        $.each( photosPathsArray, function( key, elem ) {
            var newPhoto = '<li><a data-lightbox="roadtrip" href="' + elem + '"><img src="' + elem + '" /></a><input type="checkbox" /></li>';
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