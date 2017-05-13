URI.prototype.getParameter = function(key) {
    var paramValue = this.query(true)[key];
    return paramValue;
};

$(document).ready(function() {

    $("header").load('header.html', renderNewsForm);
    $("footer").load('footer.html');
});
 
function renderNewsForm() {
    loadHeader();
    loadNews();

    setupFormMode();

    $('#saveNews').click(function() {
        alert('save news!');
    });
    
    $('#removeNews').click(function() {
        
    });
}

function loadNews() {
    var uri = URI(window.location.href);
    var newsId = uri.getParameter("id");
    var newsFileName = "database/news/news.json";

    $.getJSON(newsFileName, function(data) {
    
        var items = [];
        $.each(data, function(index, newsDetails) {
            if(newsDetails.Id && newsDetails.Id != '' && newsDetails.Description && newsDetails.Description != '') {
                items.push( "<li><textarea readonly id=news_" + newsDetails.Id + ">" + newsDetails.Description + 
                "</textarea><input type='checkbox' id='deletenews_'" + newsDetails.Id + "'/>"
                +
                "</li>" );
            }
        });
        
        var allNews = items.join("");
        $(allNews).prependTo("#newsList");
    });
}

function setupFormMode() {
    var isAdminUserLoggedIn = isAdminLoggedIn();

    if(isAdminUserLoggedIn) {

        $('textarea[id^="news_"]').removeAttr('readonly');
        $('#newsEdit').show();

        $('#removeNews').click(function() {
            alert('remove news!');


        });
    
        $('#saveNews').click(function() {
            alert('save news!');


        });
    }
    else {
        // $('input[type="text"], textarea').attr('readonly','readonly');
        //$('#newsEdit').hide();

        
        // redirect to root page if not admin
        window.location.href = "index.html";
    }
}