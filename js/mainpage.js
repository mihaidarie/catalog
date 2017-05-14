$(document).ready(function() {
    var updatesHeight = $(".updates").height();
    $(".projects").height(updatesHeight);
});

function wireupNewsHandlers() {
    var isAdminUserLoggedIn = isAdminLoggedIn();
    if(isAdminUserLoggedIn == true) {
        $('.updatesHeader').css('cursor', 'pointer');
     }else {
        $('.updatesHeader').css('cursor', '');
     }

    $('.updatesHeader').click(function(e) {
        if(isAdminUserLoggedIn == true) {
            window.location.href = "news.html";
        }

        e.stopPropagation();
    });
}

function wireupProjectsHandlers() {
    $('.projectsHeader').click(function(e) {
        var isAdminUserLoggedIn = isAdminLoggedIn();

        if(isAdminUserLoggedIn == true) {
            window.location.href = "projects.html";
        }

        e.stopPropagation();
    });
}