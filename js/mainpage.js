$(document).ready(function() {
    var updatesHeight = $(".updates").height();
    $(".projects").height(updatesHeight);

    $('.updatesHeader').click(function() {
        window.location.href = "news.html";
    });

    $('.projectsHeader').click(function() {
        window.location.href = "projects.html";
    });
    
});