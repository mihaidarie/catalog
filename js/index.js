$(document).ready(function() {
    
    $("header").load('Header.html', afterLoadHeader);
    $("footer").load('Footer.html');

});

function afterLoadHeader() {
    loadHeader();
    wireupProjectsHandlers();
    wireupNewsHandlers();
    var isAdmin = isAdminLoggedIn();
    if(isAdmin == true) {
        $('#emailsExport').show();
        $('#btnExportEmails').click(function() {    
            var url = "/exportAllEmails";
            $.getJSON(url, function(data) {
                $('#allEmails').val(data.EmailsList);            
            });
        });
    } else {
        $('#emailsExport').hide();
    }
}