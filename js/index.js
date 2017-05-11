$(document).ready(function() {
    
    $("header").load('header.html', afterLoadHeader);
    $("footer").load('footer.html');

});

function afterLoadHeader() {
    loadHeader();
    wireupProjectsHandlers();
}