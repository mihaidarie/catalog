$(document).ready(function() {
    $("header").load('header.html', renderProjectsForm);
    $("footer").load('footer.html');
});
 
function renderProjectsForm() {
    loadHeader();
    loadProjects();

    $('#saveProjects').click(function() {
        var isAdminUserLoggedIn = isAdminLoggedIn();

        if(isAdminUserLoggedIn == true) {

            var ProjectsList = [];
            $('#projectsList li[id^="project_"]').each(function(index, itemDetails) {
                var ProjectsItem = {};
                var itemId = itemDetails.id.substring(itemDetails.id.indexOf('project_') + 8);
                ProjectsItem.Id = parseInt(itemId);
                ProjectsItem.Title = itemDetails.children[0].value;
                ProjectsItem.Subtitle = itemDetails.children[1].value;
                ProjectsItem.Description = itemDetails.children[2].value;

                ProjectsList.push(ProjectsItem);
            });

            var ProjectsJson = {
                existingData : ProjectsList,
                newData : {
                    
                }
            };

            var newProjectTitle = $('#newProjectTitle').val();
            if(newProjectTitle && newProjectTitle.trim() != '') {
                ProjectsJson.newData.Title = newProjectTitle;
            }

            var newProjectSubtitle = $('#newProjectSubtitle').val();
            if(newProjectSubtitle && newProjectSubtitle.trim() != '') {
                ProjectsJson.newData.Subtitle = newProjectSubtitle;
            }

            var newProjectDescription = $('#newProjectDescription').val();
            if(newProjectDescription && newProjectDescription.trim() != '') {
                ProjectsJson.newData.Description = newProjectDescription;
            }

            var postedProjectsJson = JSON.stringify(ProjectsJson);

            var postUrl = "/saveProjects";
            $.ajax({
                url: postUrl,
                type: 'POST',
                data: postedProjectsJson,
                contentType: 'application/json',
                error: function(jqXHR, textStatus, errorThrown ) {
                    console.log('jqXHR: ' + jqXHR + " textStatus: " + textStatus + " errorThrown: " + errorThrown);
                    $('#result').text('Salvare esuata! Contactati administratorul.');
                    $('#result').css('color', 'red');
                    scrollToResult();
                    resetResultMessage();
                },
                success: function() {
                    console.log("success!");
                    $('#result').text('Salvare reusita!');
                    $('#result').css('color', 'green');
                    resetResultMessage();
                    loadProjects(true); 
                },
                complete: function() {
                    console.log("completed!");
                }
            });
        } else {
            $('#result').text('Salvare esuata! Va rugam sa va logati.');
            $('#result').css('color', 'red');
            scrollToResult();
            resetResultMessage();
        }
    });
    
    $('#removeProjects').click(function() {
        var isAdminUserLoggedIn = isAdminLoggedIn();

        if(isAdminUserLoggedIn == true) {
            var ProjectsIdsList = [];

            $('input[id^="deleteprojects_"]:checked').each(function(index, currentItem) {
                var itemId = currentItem.id.substring(currentItem.id.indexOf('deleteprojects_') + 15);
                ProjectsIdsList.push(itemId);
            });

            if(ProjectsIdsList.length > 0) {
                var postedData = JSON.stringify(ProjectsIdsList);

                var postUrl = "/removeProjects";
                $.ajax({
                    url: postUrl,
                    type: 'POST',
                    data: postedData,
                    contentType: 'application/json',
                    error: function(jqXHR, textStatus, errorThrown ) {
                        console.log('jqXHR: ' + jqXHR + " textStatus: " + textStatus + " errorThrown: " + errorThrown);
                        $('#result').text('Stergere esuata! Contactati administratorul.');
                        $('#result').css('color', 'red');
                        scrollToResult();
                        resetResultMessage();
                    },
                    success: function() {
                        console.log("success!");
                        $('#result').text('Stergere reusita!');
                        $('#result').css('color', 'green');
                        loadProjects(true);
                        resetResultMessage();
                    },
                    complete: function() {
                        console.log("completed!");
                    }
                });
            } else {
                $('#result').text('Nimic de sters!');
                $('#result').css('color', 'red');
                scrollToResult();
                resetResultMessage();
            }
        } else {
            $('#result').text('Stergere esuata! Va rugam sa va logati.');
            $('#result').css('color', 'red');
            scrollToResult();
            resetResultMessage();
        }
    });
}

function loadProjects(shouldScroll) {
    var projectsFileName = "database/Projects/Projects.json";
    
    $('#projectsList').empty();
    
    $.getJSON(projectsFileName, function(data) {
    
        var items = [];
        $.each(data, function(index, ProjectsDetails) {
            var projectIdParsed = ProjectsDetails.Id;
            var projectDetailsItem = "<li id='project_" + projectIdParsed + "'><input readonly type='text' value='" + ProjectsDetails.Title + 
                "'></input><input readonly type='text'value='" + ProjectsDetails.Subtitle + 
                "'></input><textarea readonly>" + ProjectsDetails.Description + 
                "</textarea><input type='checkbox' id='deleteprojects_" + projectIdParsed + "'/>" +
                "</li>";
                items.push(projectDetailsItem);
        });
        
        var allProjects = items.join("");
        $(allProjects).prependTo("#projectsList");

        renderNewProjectsElement();

        setupFormMode();
        
        if(shouldScroll == true) {
            scrollToResult();
        }
    });
}

function tryParseInt(str, defaultValue) {
     var retValue = defaultValue;
     if(str !== null) {
         if(str.length > 0) {
             if (!isNaN(str)) {
                 retValue = parseInt(str);
             }
         }
     }
     return retValue;
}

function renderNewProjectsElement() {
    var newProjects = "<li><input id='newProjectTitle'></input><input id='newProjectSubtitle'></input><textarea readonly id='newProjectDescription'></textarea></li>";
    $(newProjects).appendTo("#projectsList");
}

function setupFormMode() {
    var isAdminUserLoggedIn = isAdminLoggedIn();

    if(isAdminUserLoggedIn == true) {
        $('#projectsList input').removeAttr('readonly');
        $('#projectsList textarea').removeAttr('readonly');
        $('input[id^="newProject"]').removeAttr('readonly');
        $('textarea[id^="newProject"]').removeAttr('readonly');
        $('#projectsEdit').show();
    }
    else {       
        // redirect to root page if not admin
        window.location.href = "index.html";
    }
}