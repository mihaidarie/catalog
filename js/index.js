$(document).ready(function() {
    
    $("header").load('header.html', afterLoadHeader);
    $("footer").load('footer.html');

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