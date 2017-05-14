$(document).ready(function() {
    loadNews();
   
})

function loadNews() {
    
    var newsFileName = "database/news/news.json";

    $.getJSON(newsFileName, function(data) {
    
        var items = [];
        $.each(data, function(index, newsDetails) {
            if(newsDetails.Id && newsDetails.Id != '' && newsDetails.Description && newsDetails.Description != '') {
                items.push( "<li id=news_" + newsDetails.Id + ">" + newsDetails.Description + "</li>" );
            }
        });
        
        var allNews = items.join("");
        $(allNews).appendTo("#newsList");

        hookNewsClick();
    });
}