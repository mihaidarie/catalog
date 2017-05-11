$(document).ready(function() {
    var updatesHeight = $(".updates").height();
    $(".projects").height(updatesHeight);

    $('.updatesHeader').click(function() {
        window.location.href = "news.html";
    });   
});

function wireupProjectsHandlers() {
    $('.projectsHeader').click(function() {
        var isAdminUserLoggedIn = isAdminLoggedIn();

        if(isAdminUserLoggedIn == true) {
            window.location.href = "projects.html";
        }
    });
}