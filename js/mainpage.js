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

    $('.updatesHeader').click(function() {
        if(isAdminUserLoggedIn == true) {
            window.location.href = "news.html";
        }
    });
}

function wireupProjectsHandlers() {
    $('.projectsHeader').click(function() {
        var isAdminUserLoggedIn = isAdminLoggedIn();

        if(isAdminUserLoggedIn == true) {
            window.location.href = "projects.html";
        }
    });
}