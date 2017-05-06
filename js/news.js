URI.prototype.getParameter = function(key) {
    var paramValue = this.query(true)[key];
    return paramValue;
};

$(document).ready(function() {

    $("header").load('header.html', loadHeader);
    $("footer").load('footer.html');

    loadNews();

    setupFormMode();
});
 
function loadNews() {
    var uri = URI(window.location.href);
    var newsId = uri.getParameter("id");
    var newsFileName = "database/news/news.json";

    $.getJSON(newsFileName, function(data) {
    
        var items = [];
        $.each(data, function(index, newsDetails) {
            if(newsDetails.Id && newsDetails.Id != '' && newsDetails.Id == newsId && newsDetails.Description && newsDetails.Description != '') {
                $('#newsDetails').text(newsDetails.Description);
            }
        });
        
    });
}

function setupFormMode() {
    var cookieValue = Cookies.getJSON('login');

    // todo: dynamically look for admin ID

    if(cookieValue && cookieValue.UserId == 0) {
        $('input[type="text"], textarea').removeAttr('readonly');
        $('#newsEdit').show();

        $('#removeNews').click(function() {
            alert('remove news!');


        });
    
        $('#saveNews').click(function() {
            alert('save news!');


        });
    }
    else {
        $('input[type="text"], textarea').attr('readonly','readonly');
        $('#newsEdit').hide();
    }
}