$(document).ready(function() {
    var updatesHeight = $(".updates").height();
    $(".projects").height(updatesHeight);
});

function wireupNewsHandlers() {
    var isAdminUserLoggedIn = isAdminLoggedIn();
    if(isAdminUserLoggedIn == true) {
        $('.updatesHeader').css('cursor', 'pointer');
    } else {
        $('.updatesHeader').css('cursor', '');
    }

    $('.updatesHeader').click(function(e) {
        var isAdminUserLoggedIn1 = isAdminLoggedIn();
        if(isAdminUserLoggedIn1 == true) {
            window.location.href = "News.html";
        }

        e.stopPropagation();
    });
}

function wireupProjectsHandlers() {
    var isAdminUserLoggedIn = isAdminLoggedIn();
    if(isAdminUserLoggedIn == true) {
        $('.projectsHeader').css('cursor', 'pointer');
    } else {
        $('.projectsHeader').css('cursor', '');
    }

    $('.projectsHeader').click(function(e) {
        var isAdminUserLoggedIn1 = isAdminLoggedIn();

        if(isAdminUserLoggedIn1 == true) {
            window.location.href = "Projects.html";
        }

        e.stopPropagation();
    });
}