URI.prototype.getParameter = function(key) {
    var paramValue = this.query(true)[key];
    return paramValue;
};

$(document).ready(function() {

    $("header").load('header.html', loadHeader);
    $("footer").load('footer.html');

    loadNews();

    setupFormMode();

    $('#saveNews').click(function() {
        alert('save news!');
    });
    
    $('#removeNews').click(function() {
        alert('delete news!');
    });
});
 
function loadNews() {
    var uri = URI(window.location.href);
    var newsId = uri.getParameter("id");
    var newsFileName = "database/news/news.json";

    $.getJSON(newsFileName, function(data) {
    
        var items = [];
        $.each(data, function(index, newsDetails) {
            if(newsDetails.Id && newsDetails.Id != '' && newsDetails.Description && newsDetails.Description != '') {
                items.push( "<li id=news_" + newsDetails.Id + ">" + newsDetails.Description + 
                "<input type='checkbox' id='deletenews_'" + newsDetails.Id + "'/>"
                +
                "</li>" );
            }
        });
        
        var allNews = items.join("");
        $(allNews).prependTo("#newsList");
    });
}

function setupFormMode() {
    var cookieValue = Cookies.getJSON('login');

    // todo: dynamically look for admin ID

    if(cookieValue && cookieValue.UserId == 0) {

        // $('input[type="text"], textarea').removeAttr('readonly');
        // $('#newsEdit').show();

        // $('#removeNews').click(function() {
        //     alert('remove news!');


        // });
    
        // $('#saveNews').click(function() {
        //     alert('save news!');


        // });
    }
    else {
        // $('input[type="text"], textarea').attr('readonly','readonly');
        //$('#newsEdit').hide();

        
        // redirect to root page if not admin
        window.location.href = "index.html";
    }
}